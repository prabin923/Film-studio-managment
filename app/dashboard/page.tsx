"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExpenseCard, InventoryCard, RentalCard, StaffCard } from "../components/ledger-cards";
import { AnalyticsCharts } from "../components/analytics-charts";
import { MonthlyReports } from "../components/monthly-reports";
import { NewRentalPayload, RentalForm } from "../components/rental-form";
import { StudioProfileCard, StudioProfileSetup } from "../components/studio-profile";
import {
  getOwnerAccount,
  getStoredAccount,
  isStudioProfileComplete,
  normalizeAccount,
  saveAccountToRegistry,
  studioInitials,
} from "../lib/accounts";
import {
  getWorkspaceManager,
  loadWorkspaceStore,
  migrateLegacySession,
  migrateRegistryAccounts,
  saveWorkspaceStore,
  syncWorkspaceProfile,
} from "../lib/workspaces";
import { ProjectCard } from "../components/project-card";
import {
  Badge,
  EmptyState,
  Field,
  FormPanel,
  MetricTile,
  PageHeader,
  Panel,
  PanelHead,
  SplitLayout,
} from "../components/ui";
import { pageCopy } from "../lib/copy";
import { money, newId, statusTone, toPaisa } from "../lib/format";
import { accountKey, nav, seed, storageKey, today } from "../lib/seed";
import type {
  Account,
  Client,
  Expense,
  InventoryItem,
  ItemStatus,
  PayStatus,
  ProjectPaymentStatus,
  ProjectStatus,
  Rental,
  RentalStatus,
  Role,
  Staff,
  Stats,
  Store,
  View,
} from "../lib/types";

function deriveProjectPaymentStatus(client: Pick<Client, "packageAmount" | "paidAmount">): ProjectPaymentStatus {
  return client.packageAmount > 0 && client.paidAmount >= client.packageAmount ? "Paid" : "Unpaid";
}

function normalizeClient(client: Client): Client {
  return {
    ...client,
    paymentStatus: client.paymentStatus ?? deriveProjectPaymentStatus(client),
    createdAt: client.createdAt ?? client.eventDate ?? today,
  };
}

function normalizeStore(store: Store): Store {
  return { ...store, clients: store.clients.map(normalizeClient) };
}

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("owner");
  const [account, setAccount] = useState<Account | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [store, setStore] = useState<Store>(seed);
  const [loaded, setLoaded] = useState(false);
  const [profileSetupPending, setProfileSetupPending] = useState(false);
  const [profileSetupError, setProfileSetupError] = useState("");

  useEffect(() => {
    try {
      migrateRegistryAccounts();
      const migrated = migrateLegacySession();
      const savedAccount = window.localStorage.getItem(accountKey);

      if (savedAccount) {
        const parsedAccount = JSON.parse(savedAccount) as Account;
        if (parsedAccount?.email) {
          const normalized = normalizeAccount(parsedAccount);
          if (normalized.workspaceId) {
            const workspaceStore = loadWorkspaceStore(normalized.workspaceId);
            if (workspaceStore) {
              setStore(normalizeStore(workspaceStore));
            }
            setAccount(normalized);
            setRole(normalized.role);
          }
        }
      } else if (migrated.account?.workspaceId) {
        setStore(normalizeStore(migrated.store ?? seed));
        setAccount(migrated.account);
        setRole(migrated.account.role);
        const stored = getStoredAccount(migrated.account.email);
        saveAccountToRegistry({
          ...migrated.account,
          password: stored?.password,
        });
      }
    } catch {
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem(accountKey);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && account?.workspaceId) {
      saveWorkspaceStore(account.workspaceId, store);
    }
  }, [account?.workspaceId, loaded, store]);

  useEffect(() => {
    if (loaded && account) {
      window.localStorage.setItem(accountKey, JSON.stringify(account));
    }
  }, [account, loaded]);

  useEffect(() => {
    const target = nav.find((item) => item.view === view);
    if (role === "manager" && target?.ownerOnly) {
      setView("dashboard");
    }
  }, [role, view]);

  useEffect(() => {
    if (loaded && !account) {
      router.replace("/login");
    }
  }, [account, loaded, router]);

  const stats = useMemo(() => {
    const clientRevenue = store.clients.reduce((sum, item) => sum + item.paidAmount, 0);
    const clientDue = store.clients.reduce((sum, item) => sum + item.packageAmount - item.paidAmount, 0);
    const rentalRevenue = store.rentals.reduce((sum, item) => sum + item.paidAmount, 0);
    const rentalDue = store.rentals.reduce((sum, item) => sum + item.amount - item.paidAmount, 0);
    const expenses = store.expenses.reduce((sum, item) => sum + item.amount, 0);
    const payrollDue = store.staff
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + item.monthlySalary - item.advance - item.deduction, 0);
    return {
      activeProjects: store.clients.filter((item) => item.status !== "Delivered").length,
      activeRentals: store.rentals.filter((item) => item.status !== "Returned").length,
      availableItems: store.inventory.filter((item) => item.status === "Available").length,
      clientRevenue,
      clientDue,
      rentalRevenue,
      rentalDue,
      expenses,
      payrollDue,
      netCash: clientRevenue + rentalRevenue - expenses,
    };
  }, [store]);

  const setInventoryStatus = (itemId: string, status: ItemStatus) => {
    setStore((current) => ({
      ...current,
      inventory: current.inventory.map((item) => (item.id === itemId ? { ...item, status } : item)),
    }));
  };

  const updateClientStatus = (clientId: string, status: ProjectStatus) => {
    setStore((current) => ({
      ...current,
      clients: current.clients.map((item) => (item.id === clientId ? { ...item, status } : item)),
    }));
  };

  const updateClientPaymentStatus = (clientId: string, paymentStatus: ProjectPaymentStatus) => {
    setStore((current) => ({
      ...current,
      clients: current.clients.map((item) => (item.id === clientId ? { ...item, paymentStatus } : item)),
    }));
  };

  const addClient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const packageAmount = toPaisa(data.get("packageAmount"));
    const paidAmount = toPaisa(data.get("paidAmount"));
    const paymentStatus = String(data.get("paymentStatus") || "") as ProjectPaymentStatus;
    const client: Client = {
      id: newId("client"),
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      projectType: String(data.get("projectType") || "Wedding film"),
      eventDate: String(data.get("eventDate") || today),
      createdAt: today,
      location: String(data.get("location") || ""),
      packageAmount,
      paidAmount,
      paymentStatus:
        paymentStatus === "Paid" || paymentStatus === "Unpaid"
          ? paymentStatus
          : deriveProjectPaymentStatus({ packageAmount, paidAmount }),
      assignedStaff: String(data.get("assignedStaff") || ""),
      status: String(data.get("status") || "Inquiry") as ProjectStatus,
      notes: String(data.get("notes") || ""),
    };
    setStore((current) => ({ ...current, clients: [client, ...current.clients] }));
    event.currentTarget.reset();
  };

  const addExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const expense: Expense = {
      id: newId("expense"),
      date: String(data.get("date") || today),
      category: String(data.get("category") || "General"),
      vendor: String(data.get("vendor") || ""),
      amount: toPaisa(data.get("amount")),
      notes: String(data.get("notes") || ""),
    };
    setStore((current) => ({ ...current, expenses: [expense, ...current.expenses] }));
    event.currentTarget.reset();
  };

  const addStaff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const person: Staff = {
      id: newId("staff"),
      name: String(data.get("name") || ""),
      role: String(data.get("role") || ""),
      monthlySalary: toPaisa(data.get("monthlySalary")),
      advance: toPaisa(data.get("advance")),
      deduction: toPaisa(data.get("deduction")),
      status: String(data.get("status") || "Pending") as PayStatus,
    };
    setStore((current) => ({ ...current, staff: [person, ...current.staff] }));
    event.currentTarget.reset();
  };

  const addInventory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const item: InventoryItem = {
      id: newId("item"),
      name: String(data.get("name") || ""),
      category: String(data.get("category") || ""),
      serial: String(data.get("serial") || ""),
      condition: String(data.get("condition") || "Good"),
      dayRate: toPaisa(data.get("dayRate")),
      status: String(data.get("status") || "Available") as ItemStatus,
    };
    setStore((current) => ({ ...current, inventory: [item, ...current.inventory] }));
    event.currentTarget.reset();
  };

  const addRentals = (payload: NewRentalPayload) => {
    const totalRent = payload.lines.reduce((sum, line) => sum + line.amount, 0);
    let paidRemaining = payload.paidAmount;

    const rentals: Rental[] = payload.lines.map((line, index) => {
      let paidAmount = 0;
      if (payload.paidAmount > 0) {
        if (index === payload.lines.length - 1) {
          paidAmount = paidRemaining;
        } else if (totalRent > 0) {
          paidAmount = Math.round((payload.paidAmount * line.amount) / totalRent);
          paidRemaining -= paidAmount;
        } else {
          paidAmount = Math.round(payload.paidAmount / payload.lines.length);
          paidRemaining -= paidAmount;
        }
      }

      return {
        id: newId("rental"),
        renter: payload.renter,
        phone: payload.phone,
        itemId: line.itemId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        deposit: index === 0 ? payload.deposit : 0,
        amount: line.amount,
        paidAmount,
        status: "Reserved",
        returnCondition: "",
      };
    });

    const rentedIds = new Set(payload.lines.map((line) => line.itemId));
    setStore((current) => ({
      ...current,
      rentals: [...rentals, ...current.rentals],
      inventory: current.inventory.map((item) =>
        rentedIds.has(item.id) ? { ...item, status: "Rented" } : item,
      ),
    }));
  };

  const markSalaryPaid = (staffId: string) => {
    setStore((current) => ({
      ...current,
      staff: current.staff.map((item) => (item.id === staffId ? { ...item, status: "Paid" } : item)),
    }));
  };

  const updateRentalStatus = (rentalId: string, status: RentalStatus) => {
    setStore((current) => {
      const rental = current.rentals.find((item) => item.id === rentalId);
      return {
        ...current,
        rentals: current.rentals.map((item) => (item.id === rentalId ? { ...item, status } : item)),
        inventory:
          rental && status === "Returned"
            ? current.inventory.map((item) =>
                item.id === rental.itemId ? { ...item, status: "Available" } : item,
              )
            : current.inventory,
      };
    });
  };

  const deleteRecord = (collection: keyof Store, recordId: string) => {
    setStore((current) => ({
      ...current,
      [collection]: current[collection].filter((item) => item.id !== recordId),
    }));
  };

  const handleStudioProfileSetup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account || account.role !== "owner") return;

    setProfileSetupPending(true);
    setProfileSetupError("");
    try {
      const data = new FormData(event.currentTarget);
      const nextAccount = normalizeAccount({
        ...account,
        studioName: String(data.get("studioName") || ""),
        location: String(data.get("location") || ""),
        phone: String(data.get("phone") || ""),
        tagline: String(data.get("tagline") || ""),
      });

      if (!isStudioProfileComplete(nextAccount)) {
        setProfileSetupError("Enter your studio name, city, and phone.");
        return;
      }

      if (account.workspaceId) {
        syncWorkspaceProfile(account.workspaceId, {
          studioName: nextAccount.studioName,
          phone: nextAccount.phone,
          location: nextAccount.location,
          tagline: nextAccount.tagline,
        });
      }

      const stored = getStoredAccount(account.email);
      saveAccountToRegistry({
        ...nextAccount,
        password: stored?.password,
      });

      setAccount(nextAccount);
      setProfileSetupError("");
    } finally {
      setProfileSetupPending(false);
    }
  };

  const updateProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account) return;

    const data = new FormData(event.currentTarget);
    const stored = getStoredAccount(account.email);
    const nextAccount = normalizeAccount({
      ...account,
      name: String(data.get("name") || ""),
      email: String(data.get("email") || account.email),
      studioName: String(data.get("studioName") || ""),
      phone: String(data.get("phone") || ""),
      location: String(data.get("location") || ""),
      tagline: String(data.get("tagline") || ""),
    });

    if (account.role === "owner" && account.workspaceId) {
      syncWorkspaceProfile(account.workspaceId, {
        studioName: nextAccount.studioName,
        phone: nextAccount.phone,
        location: nextAccount.location,
        tagline: nextAccount.tagline,
      });
    }

    saveAccountToRegistry({
      ...nextAccount,
      password: stored?.password,
    });

    setAccount(nextAccount);
    setRole(nextAccount.role);
  };

  const signOut = () => {
    window.localStorage.removeItem(accountKey);
    setAccount(null);
    router.push("/");
  };

  const activeNav = nav.filter((item) => role === "owner" || !item.ownerOnly);
  const copy = pageCopy[view];
  const showStudioProfileSetup = account && !isStudioProfileComplete(account);

  if (!loaded || !account) {
    return null;
  }

  return (
    <>
      {showStudioProfileSetup ? (
        <StudioProfileSetup
          account={account}
          onSubmit={handleStudioProfileSetup}
          pending={profileSetupPending}
          error={profileSetupError}
        />
      ) : null}

      <main className={`app-shell${showStudioProfileSetup ? " app-shell--dimmed" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden>
            {studioInitials(account.studioName)}
          </div>
          <div>
            <div className="brand-title">{account.studioName}</div>
            <div className="brand-subtitle">WedStudio OS</div>
          </div>
        </div>
        <nav className="nav" aria-label="Main sections">
          {activeNav.map((item) => (
            <button
              className={`nav-button ${view === item.view ? "active" : ""}`}
              key={item.view}
              onClick={() => setView(item.view)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button
            className="profile-chip profile-chip--button"
            type="button"
            onClick={() => setView("profile")}
          >
            <strong>{account.name}</strong>
            <span>{account.email}</span>
          </button>
          <div className="sidebar-role">
            <span>Signed in as</span>
            <Badge tone={role === "owner" ? "positive" : "caution"}>{role === "owner" ? "Owner" : "Manager"}</Badge>
          </div>
          <button className="btn btn--secondary" style={{ width: "100%" }} type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <section className="main">
        <PageHeader
          title={copy.title}
          description={copy.description}
          action={
            <button className="btn btn--secondary" type="button" onClick={() => setStore(seed)}>
              Reset demo
            </button>
          }
        />

        {view === "dashboard" && (
          <Dashboard
            stats={stats}
            store={store}
            setView={setView}
            role={role}
            updateClientStatus={updateClientStatus}
            updateClientPaymentStatus={updateClientPaymentStatus}
          />
        )}
        {view === "clients" && (
          <Clients
            store={store}
            addClient={addClient}
            deleteClient={(recordId) => deleteRecord("clients", recordId)}
            updateClientStatus={updateClientStatus}
            updateClientPaymentStatus={updateClientPaymentStatus}
          />
        )}
        {view === "expenses" && (
          <Expenses
            expenses={store.expenses}
            addExpense={addExpense}
            deleteExpense={(recordId) => deleteRecord("expenses", recordId)}
          />
        )}
        {view === "salary" && (
          <Salary
            staff={store.staff}
            addStaff={addStaff}
            markSalaryPaid={markSalaryPaid}
            deleteStaff={(recordId) => deleteRecord("staff", recordId)}
          />
        )}
        {view === "inventory" && (
          <Inventory
            inventory={store.inventory}
            addInventory={addInventory}
            deleteItem={(recordId) => deleteRecord("inventory", recordId)}
            setInventoryStatus={setInventoryStatus}
          />
        )}
        {view === "rentals" && (
          <Rentals
            inventory={store.inventory}
            rentals={store.rentals}
            addRentals={addRentals}
            updateRentalStatus={updateRentalStatus}
            deleteRental={(recordId) => deleteRecord("rentals", recordId)}
          />
        )}
        {view === "reports" && role === "owner" && <Reports stats={stats} store={store} />}
        {view === "profile" && (
          <ProfileSettings account={account} manager={getWorkspaceManager(account.workspaceId)} onSave={updateProfile} />
        )}
      </section>
    </main>
    </>
  );
}

function ProfileSettings({
  account,
  manager,
  onSave,
}: {
  account: Account;
  manager: ReturnType<typeof getWorkspaceManager>;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const isOwner = account.role === "owner";

  return (
    <SplitLayout
      main={
        <Panel>
          <PanelHead title="Studio identity" description="Shared across owner and manager on this dashboard." />
          <StudioProfileCard account={account} />
          <div className="team-access">
            <h3>Dashboard access</h3>
            <div className="team-access__row">
              <span>Owner</span>
              <strong>{account.role === "owner" ? account.email : getOwnerAccount(account.workspaceId)?.email || "—"}</strong>
            </div>
            <div className="team-access__row">
              <span>Manager</span>
              <strong>{manager?.email || "Not registered yet"}</strong>
            </div>
            {isOwner && !manager ? (
              <p className="team-access__hint">
                Register a manager under Register → Manager using your owner email and a second email address.
              </p>
            ) : null}
          </div>
        </Panel>
      }
      aside={
        <FormPanel title="Edit profile" onSubmit={onSave} submitLabel="Save profile">
          <Field label="Studio name">
            <input name="studioName" defaultValue={account.studioName} required readOnly={!isOwner} />
          </Field>
          <Field label="City">
            <input name="location" defaultValue={account.location} required readOnly={!isOwner} />
          </Field>
          <Field label="Studio phone">
            <input name="phone" type="tel" defaultValue={account.phone} required readOnly={!isOwner} />
          </Field>
          <Field label="Tagline" span={2}>
            <input name="tagline" defaultValue={account.tagline} readOnly={!isOwner} />
          </Field>
          <Field label="Your name">
            <input name="name" defaultValue={account.name} required />
          </Field>
          <Field label="Your email">
            <input name="email" type="email" defaultValue={account.email} required />
          </Field>
          {!isOwner ? (
            <p className="muted field--wide">Studio details can only be edited by the owner account.</p>
          ) : null}
        </FormPanel>
      }
    />
  );
}

function Dashboard({
  stats,
  store,
  setView,
  role,
  updateClientStatus,
  updateClientPaymentStatus,
}: {
  stats: Stats;
  store: Store;
  setView: (view: View) => void;
  role: Role;
  updateClientStatus: (clientId: string, status: ProjectStatus) => void;
  updateClientPaymentStatus: (clientId: string, status: ProjectPaymentStatus) => void;
}) {
  const activeRentals = store.rentals.filter((rental) => rental.status !== "Returned");

  return (
    <div className="stack">
      <section className="metrics-row">
        <MetricTile label="Active projects" value={String(stats.activeProjects)} />
        <MetricTile label="Active rentals" value={String(stats.activeRentals)} />
        <MetricTile label="Client balance due" value={money(stats.clientDue)} />
        <MetricTile
          label={role === "owner" ? "Net cash recorded" : "Available gear"}
          value={role === "owner" ? money(stats.netCash) : String(stats.availableItems)}
        />
      </section>

      {role === "owner" ? <AnalyticsCharts store={store} /> : null}

      <SplitLayout
        main={
          <Panel>
            <PanelHead
              title="Upcoming work"
              description="Shoots and edits in progress."
              action={
                <button className="btn btn--ghost" type="button" onClick={() => setView("clients")}>
                  View all
                </button>
              }
            />
            <div className="project-list">
              {store.clients.map((client) => (
                <ProjectCard
                  compact
                  key={client.id}
                  client={client}
                  onStatusChange={(status) => updateClientStatus(client.id, status)}
                  onPaymentStatusChange={(status) => updateClientPaymentStatus(client.id, status)}
                />
              ))}
            </div>
          </Panel>
        }
        aside={
          <Panel>
            <PanelHead
              title="Rentals out"
              description="Gear currently reserved or with a client."
              action={
                <button className="btn btn--ghost" type="button" onClick={() => setView("rentals")}>
                  View all
                </button>
              }
            />
            {activeRentals.length === 0 ? (
              <EmptyState>No active rentals.</EmptyState>
            ) : (
              <div className="simple-list">
                {activeRentals.map((rental) => (
                  <div className="simple-list__item" key={rental.id}>
                    <strong>{store.inventory.find((item) => item.id === rental.itemId)?.name || "Unknown item"}</strong>
                    <span>
                      {rental.renter} · {rental.startDate} – {rental.endDate}
                    </span>
                    <div className="row">
                      <Badge tone={statusTone(rental.status)}>{rental.status}</Badge>
                      <Badge tone="neutral">Due {money(rental.amount - rental.paidAmount)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        }
      />
    </div>
  );
}

function Clients({
  store,
  addClient,
  deleteClient,
  updateClientStatus,
  updateClientPaymentStatus,
}: {
  store: Store;
  addClient: (event: FormEvent<HTMLFormElement>) => void;
  deleteClient: (id: string) => void;
  updateClientStatus: (clientId: string, status: ProjectStatus) => void;
  updateClientPaymentStatus: (clientId: string, status: ProjectPaymentStatus) => void;
}) {
  return (
    <SplitLayout
      main={
        <Panel>
          <PanelHead
            title="Project pipeline"
            description="Active bookings and balances."
            action={<span className="panel-head__meta">{store.clients.length} projects</span>}
          />
          {store.clients.length === 0 ? (
            <EmptyState>No projects yet. Add one using the form.</EmptyState>
          ) : (
            <div className="project-list">
              {store.clients.map((client) => (
                <ProjectCard
                  key={client.id}
                  client={client}
                  onRemove={() => deleteClient(client.id)}
                  onStatusChange={(status) => updateClientStatus(client.id, status)}
                  onPaymentStatusChange={(status) => updateClientPaymentStatus(client.id, status)}
                />
              ))}
            </div>
          )}
        </Panel>
      }
      aside={
        <FormPanel title="New project" onSubmit={addClient} submitLabel="Add project">
          <Field label="Client name">
            <input name="name" required />
          </Field>
          <Field label="Phone">
            <input name="phone" required />
          </Field>
          <Field label="Project type">
            <select name="projectType" defaultValue="Wedding film">
              <option>Wedding film</option>
              <option>Pre-wedding shoot</option>
              <option>Corporate video</option>
              <option>Music video</option>
              <option>Documentary</option>
            </select>
          </Field>
          <Field label="Event date">
            <input name="eventDate" type="date" defaultValue={today} />
          </Field>
          <Field label="Location">
            <input name="location" />
          </Field>
          <Field label="Assigned staff">
            <input name="assignedStaff" />
          </Field>
          <Field label="Package (NPR)">
            <input name="packageAmount" min="0" type="number" />
          </Field>
          <Field label="Paid (NPR)">
            <input name="paidAmount" min="0" type="number" />
          </Field>
          <Field label="Payment">
            <select name="paymentStatus" defaultValue="Unpaid">
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </Field>
          <Field label="Status" span={2}>
            <select name="status" defaultValue="Inquiry">
              <option>Inquiry</option>
              <option>Booked</option>
              <option>Editing</option>
              <option>Delivered</option>
            </select>
          </Field>
          <Field label="Notes" span={2}>
            <textarea name="notes" rows={3} />
          </Field>
        </FormPanel>
      }
    />
  );
}

function Expenses({
  expenses,
  addExpense,
  deleteExpense,
}: {
  expenses: Expense[];
  addExpense: (event: FormEvent<HTMLFormElement>) => void;
  deleteExpense: (id: string) => void;
}) {
  return (
    <SplitLayout
      main={
        <Panel>
          <PanelHead
            title="Expense ledger"
            description="Operating costs logged in NPR."
            action={<span className="panel-head__meta">{expenses.length} entries</span>}
          />
          {expenses.length === 0 ? (
            <EmptyState>No expenses recorded yet.</EmptyState>
          ) : (
            <div className="record-list">
              {expenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} onRemove={() => deleteExpense(expense.id)} />
              ))}
            </div>
          )}
        </Panel>
      }
      aside={
        <FormPanel title="New expense" onSubmit={addExpense} submitLabel="Add expense">
          <Field label="Date">
            <input name="date" type="date" defaultValue={today} />
          </Field>
          <Field label="Category">
            <select name="category" defaultValue="Travel">
              <option>Travel</option>
              <option>Equipment</option>
              <option>Office</option>
              <option>Food</option>
              <option>Software</option>
              <option>Marketing</option>
              <option>General</option>
            </select>
          </Field>
          <Field label="Vendor">
            <input name="vendor" required />
          </Field>
          <Field label="Amount (NPR)">
            <input name="amount" min="0" type="number" required />
          </Field>
          <Field label="Notes" span={2}>
            <textarea name="notes" rows={3} />
          </Field>
        </FormPanel>
      }
    />
  );
}

function Salary({
  staff,
  addStaff,
  markSalaryPaid,
  deleteStaff,
}: {
  staff: Staff[];
  addStaff: (event: FormEvent<HTMLFormElement>) => void;
  markSalaryPaid: (id: string) => void;
  deleteStaff: (id: string) => void;
}) {
  return (
    <SplitLayout
      main={
        <Panel>
          <PanelHead
            title="Payroll board"
            description="Monthly salary, advances, deductions, and payment status."
            action={<span className="panel-head__meta">{staff.length} staff</span>}
          />
          {staff.length === 0 ? (
            <EmptyState>No payroll records yet.</EmptyState>
          ) : (
            <div className="record-list">
              {staff.map((person) => (
                <StaffCard
                  key={person.id}
                  person={person}
                  onMarkPaid={() => markSalaryPaid(person.id)}
                  onRemove={() => deleteStaff(person.id)}
                />
              ))}
            </div>
          )}
        </Panel>
      }
      aside={
        <FormPanel title="Add staff member" onSubmit={addStaff} submitLabel="Add to payroll">
          <Field label="Name">
            <input name="name" required />
          </Field>
          <Field label="Role">
            <input name="role" required />
          </Field>
          <Field label="Monthly salary (NPR)">
            <input name="monthlySalary" min="0" type="number" required />
          </Field>
          <Field label="Advance (NPR)">
            <input name="advance" min="0" type="number" defaultValue="0" />
          </Field>
          <Field label="Deduction (NPR)">
            <input name="deduction" min="0" type="number" defaultValue="0" />
          </Field>
          <Field label="Status" span={2}>
            <select name="status" defaultValue="Pending">
              <option>Pending</option>
              <option>Paid</option>
            </select>
          </Field>
        </FormPanel>
      }
    />
  );
}

function Inventory({
  inventory,
  addInventory,
  deleteItem,
  setInventoryStatus,
}: {
  inventory: InventoryItem[];
  addInventory: (event: FormEvent<HTMLFormElement>) => void;
  deleteItem: (id: string) => void;
  setInventoryStatus: (id: string, status: ItemStatus) => void;
}) {
  return (
    <SplitLayout
      main={
        <Panel>
          <PanelHead
            title="Gear catalog"
            description="Availability, condition, serials, and day rates."
            action={<span className="panel-head__meta">{inventory.length} items</span>}
          />
          {inventory.length === 0 ? (
            <EmptyState>No inventory items yet.</EmptyState>
          ) : (
            <div className="record-list">
              {inventory.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onSetAvailable={() => setInventoryStatus(item.id, "Available")}
                  onSetMaintenance={() => setInventoryStatus(item.id, "Maintenance")}
                  onRemove={() => deleteItem(item.id)}
                />
              ))}
            </div>
          )}
        </Panel>
      }
      aside={
        <FormPanel title="Add gear" onSubmit={addInventory} submitLabel="Add item">
          <Field label="Item name">
            <input name="name" required />
          </Field>
          <Field label="Category">
            <select name="category" defaultValue="Camera">
              <option>Camera</option>
              <option>Lens</option>
              <option>Light</option>
              <option>Audio</option>
              <option>Drone</option>
              <option>Stabilizer</option>
              <option>Accessory</option>
            </select>
          </Field>
          <Field label="Serial / model">
            <input name="serial" />
          </Field>
          <Field label="Condition">
            <input name="condition" defaultValue="Good" />
          </Field>
          <Field label="Day rate (NPR)">
            <input name="dayRate" min="0" type="number" />
          </Field>
          <Field label="Status" span={2}>
            <select name="status" defaultValue="Available">
              <option>Available</option>
              <option>Rented</option>
              <option>Maintenance</option>
            </select>
          </Field>
        </FormPanel>
      }
    />
  );
}

function Rentals({
  inventory,
  rentals,
  addRentals,
  updateRentalStatus,
  deleteRental,
}: {
  inventory: InventoryItem[];
  rentals: Rental[];
  addRentals: (payload: NewRentalPayload) => void;
  updateRentalStatus: (id: string, status: RentalStatus) => void;
  deleteRental: (id: string) => void;
}) {
  return (
    <SplitLayout
      main={
        <Panel>
          <PanelHead
            title="Rental schedule"
            description="Bookings, deposits, balances, and returns."
            action={<span className="panel-head__meta">{rentals.length} rentals</span>}
          />
          {rentals.length === 0 ? (
            <EmptyState>No rentals yet.</EmptyState>
          ) : (
            <div className="record-list">
              {rentals.map((rental) => (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  itemName={inventory.find((item) => item.id === rental.itemId)?.name || "Unknown item"}
                  onMarkOut={() => updateRentalStatus(rental.id, "Out")}
                  onMarkReturned={() => updateRentalStatus(rental.id, "Returned")}
                  onRemove={() => deleteRental(rental.id)}
                />
              ))}
            </div>
          )}
        </Panel>
      }
      aside={<RentalForm inventory={inventory} onSubmit={addRentals} />}
    />
  );
}

function Reports({ stats, store }: { stats: Stats; store: Store }) {
  const reportRows = [
    ["Client payments", money(stats.clientRevenue)],
    ["Client balance due", money(stats.clientDue)],
    ["Rental payments", money(stats.rentalRevenue)],
    ["Rental balance due", money(stats.rentalDue)],
    ["Expenses", money(stats.expenses)],
    ["Payroll due", money(stats.payrollDue)],
    ["Net cash", money(stats.netCash)],
  ];

  return (
    <div className="stack">
      <AnalyticsCharts store={store} />
      <MonthlyReports store={store} />

      <SplitLayout
        main={
          <Panel>
            <PanelHead title="Financial snapshot" description="Recorded totals in NPR." />
          <div className="report-grid">
            {reportRows.map((row) => (
              <div className="report-cell" key={String(row[0])}>
                <span>{row[0]}</span>
                <strong>{row[1]}</strong>
              </div>
            ))}
          </div>
        </Panel>
      }
      aside={
        <Panel>
          <PanelHead title="Operations" description="Counts across the workspace." />
          <div className="summary-list">
            <SummaryLine label="Projects" value={store.clients.length} />
            <SummaryLine label="Delivered" value={store.clients.filter((item) => item.status === "Delivered").length} />
            <SummaryLine label="Inventory items" value={store.inventory.length} />
            <SummaryLine label="Available gear" value={store.inventory.filter((item) => item.status === "Available").length} />
            <SummaryLine label="Rentals returned" value={store.rentals.filter((item) => item.status === "Returned").length} />
          </div>
        </Panel>
      }
      />
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
