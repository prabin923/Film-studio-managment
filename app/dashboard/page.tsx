"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthLoadingMark } from "../components/auth-loading-mark";
import { useRouter } from "next/navigation";
import { EditModal } from "../components/edit-modal";
import { ExpenseCard, InventoryCard, RentalCard, StaffCard } from "../components/ledger-cards";
import { AdminDashboardHome } from "../components/admin-dashboard";
import { AnalyticsCharts } from "../components/analytics-charts";
import { MonthlyReports } from "../components/monthly-reports";
import { NewRentalPayload, RentalForm } from "../components/rental-form";
import { SaveStatusBar, type SaveState } from "../components/save-status";
import { ManagerInviteForm, StudioProfileCard, StudioProfileSetup } from "../components/studio-profile";
import { ThemeToggle } from "../components/theme-toggle";
import {
  confirmRemove,
  filterNavForRole,
  isDemoResetEnabled,
  parseViewFromSearch,
  sortClientsByEventDate,
} from "../lib/dashboard-utils";
import {
  apiCreateManager,
  apiGetWorkspaceTeam,
  apiLogout,
  apiMe,
  apiSaveStore,
  apiUpdateProfile,
} from "../lib/api-client";
import { isStudioProfileComplete, normalizeAccount, studioInitials } from "../lib/accounts";
import { ProjectCard } from "../components/project-card";
import {
  Badge,
  EmptyState,
  Field,
  FormPanel,
  PageHeader,
  Panel,
  PanelHead,
  SplitLayout,
} from "../components/ui";
import { pageCopy } from "../lib/copy";
import { money, newId, statusTone, toPaisa } from "../lib/format";
import { nav, seed, today } from "../lib/seed";
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
  const [managerInvitePending, setManagerInvitePending] = useState(false);
  const [managerInviteError, setManagerInviteError] = useState("");
  const [workspaceTeam, setWorkspaceTeam] = useState<{ manager: Account | null; owner: Account | null }>({
    manager: null,
    owner: null,
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const skipNextSave = useRef(true);

  const persistStore = useCallback(async (snapshot: Store) => {
    setSaveState("saving");
    setSaveError("");
    try {
      await apiSaveStore(snapshot);
      setSaveState("saved");
    } catch (error) {
      setSaveState("error");
      setSaveError(error instanceof Error ? error.message : "Failed to save changes.");
    }
  }, []);

  const navigateView = useCallback((next: View) => {
    setView(next);
    const url = new URL(window.location.href);
    if (next === "dashboard") url.searchParams.delete("view");
    else url.searchParams.set("view", next);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, []);

  useEffect(() => {
    let cancelled = false;

    apiMe()
      .then((data) => {
        if (cancelled) return;
        setAccount(normalizeAccount(data.account));
        setStore(normalizeStore(data.store));
        setRole(data.account.role);
      })
      .catch(() => {
        if (!cancelled) setAccount(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fromUrl = parseViewFromSearch(window.location.search);
    if (fromUrl) setView(fromUrl);
  }, []);

  useEffect(() => {
    if (!loaded || !account) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    setSaveState("saving");
    const timer = window.setTimeout(() => {
      void persistStore(store);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [account, loaded, store, persistStore]);

  useEffect(() => {
    if (!loaded || !account || view !== "profile") return;

    apiGetWorkspaceTeam()
      .then((data) => setWorkspaceTeam({ manager: data.manager, owner: data.owner }))
      .catch(() => setWorkspaceTeam({ manager: null, owner: null }));
  }, [account, loaded, view]);

  useEffect(() => {
    const target = nav.find((item) => item.view === view);
    if (role === "manager" && target?.ownerOnly) {
      navigateView("dashboard");
    }
  }, [role, view, navigateView]);

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

  const deleteRecord = (collection: keyof Store, recordId: string, label: string) => {
    if (!confirmRemove(label)) return;
    setStore((current) => ({
      ...current,
      [collection]: current[collection].filter((item) => item.id !== recordId),
    }));
  };

  const updateClientRecord = (clientId: string, next: Client) => {
    setStore((current) => ({
      ...current,
      clients: current.clients.map((item) => (item.id === clientId ? next : item)),
    }));
  };

  const updateExpenseRecord = (expenseId: string, next: Expense) => {
    setStore((current) => ({
      ...current,
      expenses: current.expenses.map((item) => (item.id === expenseId ? next : item)),
    }));
  };

  const updateStaffRecord = (staffId: string, next: Staff) => {
    setStore((current) => ({
      ...current,
      staff: current.staff.map((item) => (item.id === staffId ? next : item)),
    }));
  };

  const updateInventoryRecord = (itemId: string, next: InventoryItem) => {
    setStore((current) => ({
      ...current,
      inventory: current.inventory.map((item) => (item.id === itemId ? next : item)),
    }));
  };

  const handleStudioProfileSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account || account.role !== "owner") return;

    setProfileSetupPending(true);
    setProfileSetupError("");
    try {
      const data = new FormData(event.currentTarget);
      const payload = {
        name: account.name,
        email: account.email,
        studioName: String(data.get("studioName") || ""),
        location: String(data.get("location") || ""),
        phone: String(data.get("phone") || ""),
        tagline: String(data.get("tagline") || ""),
      };

      const nextAccount = normalizeAccount({ ...account, ...payload });
      if (!isStudioProfileComplete(nextAccount)) {
        setProfileSetupError("Enter your studio name, city, and phone.");
        return;
      }

      const result = await apiUpdateProfile(payload);
      setAccount(normalizeAccount(result.account));
      setProfileSetupError("");
    } catch (error) {
      setProfileSetupError(error instanceof Error ? error.message : "Failed to save profile.");
    } finally {
      setProfileSetupPending(false);
    }
  };

  const handleInviteManager = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account || account.role !== "owner") return;

    setManagerInvitePending(true);
    setManagerInviteError("");

    try {
      const data = new FormData(event.currentTarget);
      const result = await apiCreateManager({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        password: String(data.get("password") || ""),
      });
      setWorkspaceTeam((current) => ({ ...current, manager: result.manager }));
      event.currentTarget.reset();
    } catch (error) {
      setManagerInviteError(error instanceof Error ? error.message : "Failed to add manager.");
    } finally {
      setManagerInvitePending(false);
    }
  };

  const updateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account) return;

    const data = new FormData(event.currentTarget);
    try {
      const result = await apiUpdateProfile({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || account.email),
        studioName: String(data.get("studioName") || ""),
        phone: String(data.get("phone") || ""),
        location: String(data.get("location") || ""),
        tagline: String(data.get("tagline") || ""),
      });
      const nextAccount = normalizeAccount(result.account);
      setAccount(nextAccount);
      setRole(nextAccount.role);
    } catch (error) {
      console.error(error);
    }
  };

  const signOut = async () => {
    await apiLogout();
    setAccount(null);
    router.push("/");
  };

  const activeNav = filterNavForRole(role);
  const copy = pageCopy[view];
  const showStudioProfileSetup = account && !isStudioProfileComplete(account);

  if (!loaded || !account) {
    return (
      <main className="auth-shell auth-shell--loading">
        <div className="auth-loading">
          <AuthLoadingMark />
          <p>{loaded ? "Redirecting to sign in…" : "Loading your studio…"}</p>
        </div>
      </main>
    );
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

      <main className={`app-shell app-shell--admin${showStudioProfileSetup ? " app-shell--dimmed" : ""}`}>
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
              onClick={() => navigateView(item.view)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="sidebar-theme">
            <ThemeToggle />
          </div>
          <button
            className="profile-chip profile-chip--button"
            type="button"
            onClick={() => navigateView("profile")}
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
        <SaveStatusBar
          state={saveState}
          error={saveError}
          onRetry={saveState === "error" ? () => void persistStore(store) : undefined}
        />

        {view !== "dashboard" ? (
          <PageHeader
            title={copy.title}
            description={copy.description}
            action={
              isDemoResetEnabled() ? (
                <button className="btn btn--secondary" type="button" onClick={() => setStore(seed)}>
                  Reset demo
                </button>
              ) : undefined
            }
          />
        ) : null}

        {view === "dashboard" && (
          <AdminDashboardHome
            stats={stats}
            store={store}
            setView={navigateView}
            role={role}
            updateClientStatus={updateClientStatus}
            updateClientPaymentStatus={updateClientPaymentStatus}
          />
        )}
        {view === "clients" && (
          <Clients
            store={store}
            addClient={addClient}
            deleteClient={(recordId, label) => deleteRecord("clients", recordId, label)}
            updateClient={updateClientRecord}
            updateClientStatus={updateClientStatus}
            updateClientPaymentStatus={updateClientPaymentStatus}
          />
        )}
        {view === "expenses" && (
          <Expenses
            expenses={store.expenses}
            addExpense={addExpense}
            updateExpense={updateExpenseRecord}
            deleteExpense={(recordId, label) => deleteRecord("expenses", recordId, label)}
          />
        )}
        {view === "salary" && (
          <Salary
            staff={store.staff}
            addStaff={addStaff}
            updateStaff={updateStaffRecord}
            markSalaryPaid={markSalaryPaid}
            deleteStaff={(recordId, label) => deleteRecord("staff", recordId, label)}
          />
        )}
        {view === "inventory" && (
          <Inventory
            inventory={store.inventory}
            addInventory={addInventory}
            updateItem={updateInventoryRecord}
            deleteItem={(recordId, label) => deleteRecord("inventory", recordId, label)}
            setInventoryStatus={setInventoryStatus}
          />
        )}
        {view === "rentals" && (
          <Rentals
            inventory={store.inventory}
            rentals={store.rentals}
            addRentals={addRentals}
            updateRentalStatus={updateRentalStatus}
            deleteRental={(recordId, label) => deleteRecord("rentals", recordId, label)}
          />
        )}
        {view === "reports" && role === "owner" && <Reports stats={stats} store={store} />}
        {view === "profile" && (
          <ProfileSettings
            account={account}
            manager={workspaceTeam.manager}
            owner={workspaceTeam.owner}
            onSave={updateProfile}
            onInviteManager={handleInviteManager}
            managerInvitePending={managerInvitePending}
            managerInviteError={managerInviteError}
          />
        )}
      </section>
    </main>
    </>
  );
}

function ProfileSettings({
  account,
  manager,
  owner,
  onSave,
  onInviteManager,
  managerInvitePending,
  managerInviteError,
}: {
  account: Account;
  manager: Account | null;
  owner: Account | null;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onInviteManager: (event: FormEvent<HTMLFormElement>) => void;
  managerInvitePending: boolean;
  managerInviteError: string;
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
              <strong>{account.role === "owner" ? account.email : owner?.email || "—"}</strong>
            </div>
            <div className="team-access__row">
              <span>Manager</span>
              <strong>
                {manager ? (
                  <>
                    {manager.name} · {manager.email}
                  </>
                ) : (
                  "None yet"
                )}
              </strong>
            </div>
            {isOwner && !manager ? (
              <ManagerInviteForm
                onSubmit={onInviteManager}
                pending={managerInvitePending}
                error={managerInviteError}
              />
            ) : null}
            {isOwner && manager ? (
              <p className="team-access__hint">
                Your manager can sign in at the login page with their email and password.
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


function nprField(paisa: number) {
  return paisa > 0 ? String(Math.round(paisa / 100)) : "";
}

function Clients({
  store,
  addClient,
  deleteClient,
  updateClient,
  updateClientStatus,
  updateClientPaymentStatus,
}: {
  store: Store;
  addClient: (event: FormEvent<HTMLFormElement>) => void;
  deleteClient: (id: string, label: string) => void;
  updateClient: (id: string, next: Client) => void;
  updateClientStatus: (clientId: string, status: ProjectStatus) => void;
  updateClientPaymentStatus: (clientId: string, status: ProjectPaymentStatus) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<ProjectPaymentStatus | "all">("all");
  const [editing, setEditing] = useState<Client | null>(null);

  const staffNames = store.staff.map((person) => person.name).filter(Boolean);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortClientsByEventDate(
      store.clients.filter((client) => {
        if (statusFilter !== "all" && client.status !== statusFilter) return false;
        if (paymentFilter !== "all" && client.paymentStatus !== paymentFilter) return false;
        if (!query) return true;
        return (
          client.name.toLowerCase().includes(query) ||
          client.phone.includes(query) ||
          client.projectType.toLowerCase().includes(query) ||
          client.location.toLowerCase().includes(query)
        );
      }),
    );
  }, [store.clients, search, statusFilter, paymentFilter]);

  const saveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const packageAmount = toPaisa(data.get("packageAmount"));
    const paidAmount = toPaisa(data.get("paidAmount"));
    const paymentStatus = String(data.get("paymentStatus") || "") as ProjectPaymentStatus;
    updateClient(editing.id, {
      ...editing,
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      projectType: String(data.get("projectType") || "Wedding film"),
      eventDate: String(data.get("eventDate") || today),
      location: String(data.get("location") || ""),
      assignedStaff: String(data.get("assignedStaff") || ""),
      packageAmount,
      paidAmount,
      paymentStatus:
        paymentStatus === "Paid" || paymentStatus === "Unpaid"
          ? paymentStatus
          : deriveProjectPaymentStatus({ packageAmount, paidAmount }),
      status: String(data.get("status") || "Inquiry") as ProjectStatus,
      notes: String(data.get("notes") || ""),
    });
    setEditing(null);
  };

  return (
    <>
      <SplitLayout
        main={
          <Panel>
            <PanelHead
              title="Project pipeline"
              description="Sorted by event date — upcoming shoots first."
              action={<span className="panel-head__meta">{filtered.length} shown</span>}
            />
            <div className="list-toolbar">
              <input
                className="list-toolbar__search"
                type="search"
                placeholder="Search client, phone, type…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search projects"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ProjectStatus | "all")}
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="Inquiry">Inquiry</option>
                <option value="Booked">Booked</option>
                <option value="Editing">Editing</option>
                <option value="Delivered">Delivered</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value as ProjectPaymentStatus | "all")}
                aria-label="Filter by payment"
              >
                <option value="all">All payments</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            {store.clients.length === 0 ? (
              <EmptyState>Add your first wedding project using the form on the right.</EmptyState>
            ) : filtered.length === 0 ? (
              <EmptyState>No projects match your filters.</EmptyState>
            ) : (
              <div className="project-list">
                {filtered.map((client) => (
                  <ProjectCard
                    key={client.id}
                    client={client}
                    onEdit={() => setEditing(client)}
                    onRemove={() => deleteClient(client.id, client.name)}
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
              <input name="phone" type="tel" required />
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
              <input name="assignedStaff" list="staff-names" />
              <datalist id="staff-names">
                {staffNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
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

      <EditModal
        title="Edit project"
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSubmit={saveEdit}
      >
        {editing ? (
          <>
            <Field label="Client name">
              <input name="name" defaultValue={editing.name} required />
            </Field>
            <Field label="Phone">
              <input name="phone" type="tel" defaultValue={editing.phone} required />
            </Field>
            <Field label="Project type">
              <select name="projectType" defaultValue={editing.projectType}>
                <option>Wedding film</option>
                <option>Pre-wedding shoot</option>
                <option>Corporate video</option>
                <option>Music video</option>
                <option>Documentary</option>
              </select>
            </Field>
            <Field label="Event date">
              <input name="eventDate" type="date" defaultValue={editing.eventDate} />
            </Field>
            <Field label="Location">
              <input name="location" defaultValue={editing.location} />
            </Field>
            <Field label="Assigned staff">
              <input name="assignedStaff" list="staff-names-edit" defaultValue={editing.assignedStaff} />
              <datalist id="staff-names-edit">
                {staffNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </Field>
            <Field label="Package (NPR)">
              <input name="packageAmount" min="0" type="number" defaultValue={nprField(editing.packageAmount)} />
            </Field>
            <Field label="Paid (NPR)">
              <input name="paidAmount" min="0" type="number" defaultValue={nprField(editing.paidAmount)} />
            </Field>
            <Field label="Payment">
              <select name="paymentStatus" defaultValue={editing.paymentStatus}>
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </Field>
            <Field label="Status" span={2}>
              <select name="status" defaultValue={editing.status}>
                <option>Inquiry</option>
                <option>Booked</option>
                <option>Editing</option>
                <option>Delivered</option>
              </select>
            </Field>
            <Field label="Notes" span={2}>
              <textarea name="notes" rows={3} defaultValue={editing.notes} />
            </Field>
          </>
        ) : null}
      </EditModal>
    </>
  );
}

function Expenses({
  expenses,
  addExpense,
  updateExpense,
  deleteExpense,
}: {
  expenses: Expense[];
  addExpense: (event: FormEvent<HTMLFormElement>) => void;
  updateExpense: (id: string, next: Expense) => void;
  deleteExpense: (id: string, label: string) => void;
}) {
  const [editing, setEditing] = useState<Expense | null>(null);

  const saveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    updateExpense(editing.id, {
      ...editing,
      date: String(data.get("date") || today),
      category: String(data.get("category") || "General"),
      vendor: String(data.get("vendor") || ""),
      amount: toPaisa(data.get("amount")),
      notes: String(data.get("notes") || ""),
    });
    setEditing(null);
  };

  return (
    <>
      <SplitLayout
        main={
          <Panel>
            <PanelHead
              title="Expense ledger"
              description="Operating costs logged in NPR."
              action={<span className="panel-head__meta">{expenses.length} entries</span>}
            />
            {expenses.length === 0 ? (
              <EmptyState>Log your first operating expense using the form on the right.</EmptyState>
            ) : (
              <div className="record-list">
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEdit={() => setEditing(expense)}
                    onRemove={() => deleteExpense(expense.id, expense.vendor)}
                  />
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

      <EditModal title="Edit expense" open={editing !== null} onClose={() => setEditing(null)} onSubmit={saveEdit}>
        {editing ? (
          <>
            <Field label="Date">
              <input name="date" type="date" defaultValue={editing.date} />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={editing.category}>
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
              <input name="vendor" defaultValue={editing.vendor} required />
            </Field>
            <Field label="Amount (NPR)">
              <input name="amount" min="0" type="number" defaultValue={nprField(editing.amount)} required />
            </Field>
            <Field label="Notes" span={2}>
              <textarea name="notes" rows={3} defaultValue={editing.notes} />
            </Field>
          </>
        ) : null}
      </EditModal>
    </>
  );
}

function Salary({
  staff,
  addStaff,
  updateStaff,
  markSalaryPaid,
  deleteStaff,
}: {
  staff: Staff[];
  addStaff: (event: FormEvent<HTMLFormElement>) => void;
  updateStaff: (id: string, next: Staff) => void;
  markSalaryPaid: (id: string) => void;
  deleteStaff: (id: string, label: string) => void;
}) {
  const [editing, setEditing] = useState<Staff | null>(null);

  const saveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    updateStaff(editing.id, {
      ...editing,
      name: String(data.get("name") || ""),
      role: String(data.get("role") || ""),
      monthlySalary: toPaisa(data.get("monthlySalary")),
      advance: toPaisa(data.get("advance")),
      deduction: toPaisa(data.get("deduction")),
      status: String(data.get("status") || "Pending") as PayStatus,
    });
    setEditing(null);
  };

  return (
    <>
      <SplitLayout
        main={
          <Panel>
            <PanelHead
              title="Payroll board"
              description="Monthly salary, advances, deductions, and payment status."
              action={<span className="panel-head__meta">{staff.length} staff</span>}
            />
            {staff.length === 0 ? (
              <EmptyState>Add your first team member to track payroll.</EmptyState>
            ) : (
              <div className="record-list">
                {staff.map((person) => (
                  <StaffCard
                    key={person.id}
                    person={person}
                    onMarkPaid={() => markSalaryPaid(person.id)}
                    onEdit={() => setEditing(person)}
                    onRemove={() => deleteStaff(person.id, person.name)}
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

      <EditModal title="Edit staff" open={editing !== null} onClose={() => setEditing(null)} onSubmit={saveEdit}>
        {editing ? (
          <>
            <Field label="Name">
              <input name="name" defaultValue={editing.name} required />
            </Field>
            <Field label="Role">
              <input name="role" defaultValue={editing.role} required />
            </Field>
            <Field label="Monthly salary (NPR)">
              <input name="monthlySalary" min="0" type="number" defaultValue={nprField(editing.monthlySalary)} required />
            </Field>
            <Field label="Advance (NPR)">
              <input name="advance" min="0" type="number" defaultValue={nprField(editing.advance)} />
            </Field>
            <Field label="Deduction (NPR)">
              <input name="deduction" min="0" type="number" defaultValue={nprField(editing.deduction)} />
            </Field>
            <Field label="Status" span={2}>
              <select name="status" defaultValue={editing.status}>
                <option>Pending</option>
                <option>Paid</option>
              </select>
            </Field>
          </>
        ) : null}
      </EditModal>
    </>
  );
}

function Inventory({
  inventory,
  addInventory,
  updateItem,
  deleteItem,
  setInventoryStatus,
}: {
  inventory: InventoryItem[];
  addInventory: (event: FormEvent<HTMLFormElement>) => void;
  updateItem: (id: string, next: InventoryItem) => void;
  deleteItem: (id: string, label: string) => void;
  setInventoryStatus: (id: string, status: ItemStatus) => void;
}) {
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const saveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    updateItem(editing.id, {
      ...editing,
      name: String(data.get("name") || ""),
      category: String(data.get("category") || ""),
      serial: String(data.get("serial") || ""),
      condition: String(data.get("condition") || "Good"),
      dayRate: toPaisa(data.get("dayRate")),
      status: String(data.get("status") || "Available") as ItemStatus,
    });
    setEditing(null);
  };

  return (
    <>
      <SplitLayout
        main={
          <Panel>
            <PanelHead
              title="Gear catalog"
              description="Availability, condition, serials, and day rates."
              action={<span className="panel-head__meta">{inventory.length} items</span>}
            />
            {inventory.length === 0 ? (
              <EmptyState>Add your first gear item to track rentals.</EmptyState>
            ) : (
              <div className="record-list">
                {inventory.map((item) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    onSetAvailable={() => setInventoryStatus(item.id, "Available")}
                    onSetMaintenance={() => setInventoryStatus(item.id, "Maintenance")}
                    onEdit={() => setEditing(item)}
                    onRemove={() => deleteItem(item.id, item.name)}
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

      <EditModal title="Edit gear" open={editing !== null} onClose={() => setEditing(null)} onSubmit={saveEdit}>
        {editing ? (
          <>
            <Field label="Item name">
              <input name="name" defaultValue={editing.name} required />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={editing.category}>
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
              <input name="serial" defaultValue={editing.serial} />
            </Field>
            <Field label="Condition">
              <input name="condition" defaultValue={editing.condition} />
            </Field>
            <Field label="Day rate (NPR)">
              <input name="dayRate" min="0" type="number" defaultValue={nprField(editing.dayRate)} />
            </Field>
            <Field label="Status" span={2}>
              <select name="status" defaultValue={editing.status}>
                <option>Available</option>
                <option>Rented</option>
                <option>Maintenance</option>
              </select>
            </Field>
          </>
        ) : null}
      </EditModal>
    </>
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
  deleteRental: (id: string, label: string) => void;
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
            <EmptyState>Create your first rental booking using the form on the right.</EmptyState>
          ) : (
            <div className="record-list">
              {rentals.map((rental) => (
                <RentalCard
                  key={rental.id}
                  rental={rental}
                  itemName={inventory.find((item) => item.id === rental.itemId)?.name || "Unknown item"}
                  onMarkOut={() => updateRentalStatus(rental.id, "Out")}
                  onMarkReturned={() => updateRentalStatus(rental.id, "Returned")}
                  onRemove={() => deleteRental(rental.id, rental.renter)}
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
