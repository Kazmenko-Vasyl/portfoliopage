import "./CapabilityPanel.css";
import type { Capability } from "./capabilities";

interface Props {
  capability: Capability;
  onClose: () => void;
}

/** Modal shown over the hero when a capability chip is clicked. */
export function CapabilityPanel({ capability, onClose }: Props) {
  const { index, title, caption, Demo } = capability;

  return (
    <div
      className="capability-panel__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="capability-panel" onClick={(e) => e.stopPropagation()}>
        <div className="capability-panel__head">
          <div className="capability-panel__title">
            <span className="capability-panel__index">{index}</span>
            <span className="capability-panel__name">{title}</span>
          </div>
          <button
            type="button"
            className="capability-panel__close"
            aria-label="Close"
            onClick={onClose}
          >
            esc
          </button>
        </div>

        <div className="capability-panel__body">
          <Demo />
        </div>

        <p className="capability-panel__caption">{caption}</p>
      </div>
    </div>
  );
}
