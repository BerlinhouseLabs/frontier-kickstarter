import {
  FrontierSDK,
  type PaginatedResponse,
  type Sponsor,
  type SponsorPass,
  type User
} from '@frontiertower/frontier-sdk';
import { isInFrontierApp, renderStandaloneMessage } from '@frontiertower/frontier-sdk/ui-utils';
import './style.css';

const sdk = new FrontierSDK();
const PAGE_SIZE = 6;

interface AppState {
  user?: User;
  sponsors: Sponsor[];
  selectedSponsorId?: number;
  passes: SponsorPass[];
  totalCount: number;
  page: number;
  showRevoked: boolean;
  loading: boolean;
  passesLoading: boolean;
  creating: boolean;
  revokingId?: number;
  error?: string;
  formError?: string;
  modalOpen: boolean;
}

const app = document.querySelector<HTMLDivElement>('#app');

let state: AppState = {
  sponsors: [],
  passes: [],
  totalCount: 0,
  page: 1,
  showRevoked: false,
  loading: true,
  passesLoading: false,
  creating: false,
  modalOpen: false
};

function update(partial: Partial<AppState>) {
  state = { ...state, ...partial };
  render();
}

function formatDate(value: string | null) {
  if (!value) return 'No expiry';
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderPass(pass: SponsorPass) {
  const statusClass = pass.status === 'active' ? 'badge badge-success' : 'badge badge-muted';
  const statusLabel = pass.status === 'active' ? 'Active' : 'Revoked';
  return `
    <div class="pass-card">
      <div class="pass-header">
        <div>
          <p class="pass-name">${pass.firstName} ${pass.lastName}</p>
          <p class="pass-email">${pass.email}</p>
        </div>
        <span class="${statusClass}">${statusLabel}</span>
      </div>
      <div class="pass-meta">
        <div>
          <p class="label">Sponsor</p>
          <p class="value">${pass.sponsorName || 'Unknown'}</p>
        </div>
        <div>
          <p class="label">Created</p>
          <p class="value">${formatDate(pass.createdAt)}</p>
        </div>
        <div>
          <p class="label">Expires</p>
          <p class="value">${formatDate(pass.expiresAt)}</p>
        </div>
      </div>
      <div class="pass-actions">
        ${pass.status === 'active'
          ? `<button class="ghost danger" data-revoke-id="${pass.id}" ${state.revokingId === pass.id ? 'disabled' : ''}>
              ${state.revokingId === pass.id ? 'Revoking…' : 'Revoke'}
            </button>`
          : `<span class="muted">Revoked ${pass.revokedAt ? ' · ' + formatDate(pass.revokedAt) : ''}</span>`}
      </div>
    </div>
  `;
}

function renderEmptyState(message: string) {
  return `
    <div class="empty">
      <p>${message}</p>
    </div>
  `;
}

function renderSkeletons(count: number) {
  return new Array(count)
    .fill(null)
    .map(
      () => `
        <div class="pass-card skeleton">
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-40"></div>
          <div class="skeleton-line"></div>
        </div>
      `
    )
    .join('');
}

function renderError(message: string) {
  return `<div class="toast error">${message}</div>`;
}

function renderControls() {
  const hasSponsors = state.sponsors.length > 0;
  const selected = state.selectedSponsorId;
  return `
    <div class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Sponsor Switcher</p>
          <h2>Manage passes effortlessly</h2>
        </div>
        <button class="primary" id="open-create" ${!selected ? 'disabled' : ''}>Create Pass</button>
      </div>
      <div class="control-grid">
        <label class="field">
          <span>Active sponsor</span>
          <div class="select-wrap">
            <select id="sponsor-select" ${!hasSponsors ? 'disabled' : ''}>
              ${state.sponsors
                .map(
                  (sponsor) => `
                    <option value="${sponsor.id}" ${sponsor.id === selected ? 'selected' : ''}>${sponsor.name}</option>
                  `
                )
                .join('')}
            </select>
          </div>
        </label>
        <label class="toggle">
          <input type="checkbox" id="toggle-revoked" ${state.showRevoked ? 'checked' : ''} />
          <div>
            <p>Show revoked passes</p>
            <span class="muted">Includes historical records</span>
          </div>
        </label>
      </div>
    </div>
  `;
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(state.totalCount / PAGE_SIZE));
  const prevDisabled = state.page === 1 || state.passesLoading;
  const nextDisabled = state.page >= totalPages || state.passesLoading;
  return `
    <div class="pagination">
      <button class="ghost" id="prev-page" ${prevDisabled ? 'disabled' : ''}>Prev</button>
      <span>Page ${state.page} of ${Number.isFinite(totalPages) ? totalPages : 1}</span>
      <button class="ghost" id="next-page" ${nextDisabled ? 'disabled' : ''}>Next</button>
    </div>
  `;
}

function renderModal() {
  if (!state.modalOpen) return '';
  return `
    <div class="modal-backdrop" id="close-modal"></div>
    <div class="modal">
      <div class="modal-header">
        <div>
          <p class="eyebrow">Create Pass</p>
          <h3>Onboard a new member</h3>
        </div>
        <button class="icon-btn" id="dismiss-modal" aria-label="Close">×</button>
      </div>
      ${state.formError ? renderError(state.formError) : ''}
      <form id="create-form" class="form">
        <div class="two-col">
          <label class="field">
            <span>First name *</span>
            <input name="firstName" required placeholder="Ada" />
          </label>
          <label class="field">
            <span>Last name *</span>
            <input name="lastName" required placeholder="Lovelace" />
          </label>
        </div>
        <label class="field">
          <span>Email *</span>
          <input type="email" name="email" required placeholder="ada@example.com" />
        </label>
        <label class="field">
          <span>Expires at</span>
          <input type="datetime-local" name="expiresAt" />
          <small class="muted">Leave empty for no expiry</small>
        </label>
        <button class="primary w-full" type="submit" ${state.creating ? 'disabled' : ''}>
          ${state.creating ? 'Creating…' : 'Create pass'}
        </button>
      </form>
    </div>
  `;
}

function render() {
  if (!app) return;

  if (!isInFrontierApp()) {
    renderStandaloneMessage(app, 'Sponsor Pass Manager');
    return;
  }

  if (state.loading) {
    app.innerHTML = '<div class="loading">Booting the Sponsor Pass Manager…</div>';
    return;
  }

  const greeting = state.user?.firstName || state.user?.username || 'Sponsor';

  const passesSection = state.passesLoading
    ? renderSkeletons(3)
    : state.passes.length
      ? state.passes.map(renderPass).join('')
      : renderEmptyState(state.selectedSponsorId ? 'No passes yet. Start by creating one!' : 'Choose a sponsor to view passes.');

  app.innerHTML = `
    <div class="page">
      <header class="hero">
        <div>
          <p class="eyebrow">Frontier Tower · Sponsor Ops</p>
          <h1>Sponsor Pass Control</h1>
          <p class="muted">Hi ${greeting}! Craft, monitor, and revoke passes with precision.</p>
        </div>
        <div class="chips">
          <span class="badge">Live</span>
          <span class="badge badge-ghost">Modern UI</span>
        </div>
      </header>

      ${state.error ? renderError(state.error) : ''}

      ${renderControls()}

      <section class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Passes</p>
            <h2>${state.showRevoked ? 'Active + revoked passes' : 'Active passes'}</h2>
          </div>
          <div class="muted">${state.totalCount} total</div>
        </div>
        <div class="pass-grid">${passesSection}</div>
        ${state.totalCount > PAGE_SIZE ? renderPagination() : ''}
      </section>
    </div>
    ${renderModal()}
  `;

  attachEvents();
}

async function loadPasses() {
  if (!state.selectedSponsorId) return;
  update({ passesLoading: true, error: undefined });

  try {
    const partnerships = sdk.getPartnerships();
    const offset = (state.page - 1) * PAGE_SIZE;
    const response: PaginatedResponse<SponsorPass> = state.showRevoked
      ? await partnerships.listAllSponsorPasses({ includeRevoked: true, limit: PAGE_SIZE, offset })
      : await partnerships.listActiveSponsorPasses({ limit: PAGE_SIZE, offset });

    const filtered = response.results.filter((pass) => pass.sponsor === state.selectedSponsorId);
    update({
      passes: filtered,
      totalCount: response.count ?? filtered.length,
      passesLoading: false
    });
  } catch (error) {
    console.error(error);
    update({ passesLoading: false, error: error instanceof Error ? error.message : 'Failed to load passes' });
  }
}

async function bootstrap() {
  if (!app) return;

  if (!isInFrontierApp()) {
    renderStandaloneMessage(app, 'Sponsor Pass Manager');
    return;
  }

  update({ loading: true });

  try {
    const [user, sponsorsResponse] = await Promise.all([
      sdk.getUser().getDetails(),
      sdk.getPartnerships().listSponsors({ limit: 50, offset: 0 })
    ]);
    const sponsors = sponsorsResponse.results ?? [];
    const defaultSponsor = sponsors[0]?.id;

    update({
      user,
      sponsors,
      selectedSponsorId: defaultSponsor,
      loading: false,
      error: sponsors.length ? undefined : 'No sponsors found for your account yet.'
    });

    if (defaultSponsor) {
      await loadPasses();
    }
  } catch (error) {
    console.error(error);
    update({
      loading: false,
      error: error instanceof Error ? error.message : 'Unable to initialize app'
    });
  }
}

function attachEvents() {
  const sponsorSelect = document.querySelector<HTMLSelectElement>('#sponsor-select');
  sponsorSelect?.addEventListener('change', async (event) => {
    const value = Number((event.target as HTMLSelectElement).value);
    update({ selectedSponsorId: value, page: 1 });
    await loadPasses();
  });

  const toggle = document.querySelector<HTMLInputElement>('#toggle-revoked');
  toggle?.addEventListener('change', async (event) => {
    const checked = (event.target as HTMLInputElement).checked;
    update({ showRevoked: checked, page: 1 });
    await loadPasses();
  });

  const prev = document.querySelector<HTMLButtonElement>('#prev-page');
  prev?.addEventListener('click', async () => {
    if (state.page === 1) return;
    update({ page: state.page - 1 });
    await loadPasses();
  });

  const next = document.querySelector<HTMLButtonElement>('#next-page');
  next?.addEventListener('click', async () => {
    const totalPages = Math.max(1, Math.ceil(state.totalCount / PAGE_SIZE));
    if (state.page >= totalPages) return;
    update({ page: state.page + 1 });
    await loadPasses();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-revoke-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = Number(button.dataset.revokeId);
      if (!id) return;
      update({ revokingId: id });
      try {
        await sdk.getPartnerships().revokeSponsorPass({ id });
        await loadPasses();
      } catch (error) {
        console.error(error);
        update({ error: error instanceof Error ? error.message : 'Failed to revoke pass' });
      } finally {
        update({ revokingId: undefined });
      }
    });
  });

  const openCreate = document.querySelector<HTMLButtonElement>('#open-create');
  openCreate?.addEventListener('click', () => {
    update({ modalOpen: true, formError: undefined });
  });

  const closeModal = document.querySelector<HTMLElement>('#close-modal');
  const dismissModal = document.querySelector<HTMLElement>('#dismiss-modal');
  closeModal?.addEventListener('click', () => update({ modalOpen: false, formError: undefined }));
  dismissModal?.addEventListener('click', () => update({ modalOpen: false, formError: undefined }));

  const createForm = document.querySelector<HTMLFormElement>('#create-form');
  createForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.selectedSponsorId) {
      update({ formError: 'Select a sponsor first.' });
      return;
    }

    const data = new FormData(createForm);
    const firstName = (data.get('firstName') as string)?.trim();
    const lastName = (data.get('lastName') as string)?.trim();
    const email = (data.get('email') as string)?.trim();
    const expiresAtInput = (data.get('expiresAt') as string)?.trim();

    if (!firstName || !lastName || !email) {
      update({ formError: 'Please fill all required fields.' });
      return;
    }

    const expiresAt = expiresAtInput ? new Date(expiresAtInput).toISOString() : undefined;

    update({ creating: true, formError: undefined });

    try {
      await sdk.getPartnerships().createSponsorPass({
        sponsor: state.selectedSponsorId,
        firstName,
        lastName,
        email,
        expiresAt
      });

      update({ modalOpen: false, creating: false, page: 1 });
      await loadPasses();
    } catch (error) {
      console.error(error);
      update({
        creating: false,
        formError: error instanceof Error ? error.message : 'Failed to create pass'
      });
    }
  });
}

bootstrap();
