export type SolutionId = 'calendar' | 'deadlines' | 'financial' | 'documents' | 'messages';
export type Gesture = 'click' | 'type' | 'inspect';
export type StoryPhase = 'moving' | 'pressing' | 'reading';
export type StoryCue = { target: string; gesture: Gesture };

export const solutionChoreography: Record<SolutionId, StoryCue[]> = {
  calendar: [
    { target: '.demo-day.today .demo-day-heading', gesture: 'inspect' },
    { target: '.demo-appointment.hearing', gesture: 'click' },
    { target: '.demo-appointment.hearing, .demo-event-popover.open h5', gesture: 'click' },
    { target: '.demo-event-meta', gesture: 'inspect' },
    { target: '.demo-reminder', gesture: 'click' },
    { target: '.demo-reminder', gesture: 'inspect' },
  ],
  deadlines: [
    { target: '.demo-court-select', gesture: 'inspect' },
    { target: '.demo-court-select select', gesture: 'click' },
    { target: '.demo-court-preview .selected, .demo-court-select select', gesture: 'click' },
    { target: '.demo-regional-fields .demo-field:first-child>div', gesture: 'type' },
    { target: '.demo-regional-fields .demo-field:last-child>div', gesture: 'type' },
    { target: '.demo-regional-form>.demo-action, .regional-counting', gesture: 'click' },
    { target: '.demo-regional-form>.demo-action', gesture: 'inspect' },
    { target: '.demo-add-event', gesture: 'click' },
    { target: '.event-dialog-title-input', gesture: 'type' },
    { target: '.event-dialog-save', gesture: 'click' },
  ],
  financial: [
    { target: '.demo-finance-summary', gesture: 'inspect' },
    { target: '.demo-table-row:first-of-type, .demo-table-row', gesture: 'click' },
    { target: '.demo-table-row.selected, .demo-drawer.open h5', gesture: 'click' },
    { target: '.demo-drawer.open .demo-field:last-of-type>div', gesture: 'click' },
    { target: '.demo-drawer.open .demo-action', gesture: 'click' },
    { target: '.demo-drawer.open .demo-drawer-header>svg, .demo-table-row.selected', gesture: 'click' },
  ],
  documents: [
    { target: '.doc-client-row[data-client="maria"]', gesture: 'inspect' },
    { target: '.doc-client-row[data-client="maria"], .doc-active-client', gesture: 'click' },
    { target: '.doc-file-actions .doc-preview, .doc-file-row', gesture: 'inspect' },
    { target: '.demo-team-notification, .doc-active-client', gesture: 'click' },
    { target: '.doc-assume-action .demo-action, .doc-bot-notice', gesture: 'click' },
    { target: '.demo-redirect-dialog, .doc-bot-notice', gesture: 'inspect' },
    { target: '.demo-redirect-dialog, .wa-composer', gesture: 'inspect' },
  ],
  messages: [
    { target: '.demo-day-suggestions h5', gesture: 'inspect' },
    { target: '.demo-suggestion:nth-of-type(2)', gesture: 'click' },
    { target: '.demo-message-copy', gesture: 'inspect' },
    { target: '.demo-customize-action, .demo-edit-label', gesture: 'click' },
    { target: '.demo-message-copy', gesture: 'type' },
    { target: '.demo-personal-send .demo-action', gesture: 'click' },
    { target: '.demo-personal-send .demo-action, .demo-day-suggestions h5', gesture: 'inspect' },
    { target: '.demo-daily-dispatch .demo-action', gesture: 'click' },
  ],
};
export const finalStoryStep = (id: SolutionId) => solutionChoreography[id].length - 1;
