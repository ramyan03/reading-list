import Countdown from './Countdown.jsx';
import PlanBoard from './PlanBoard.jsx';

/**
 * The whole plan. The words are fixed in data/plan.js; each item ticks itself
 * off once it is finished, and opens the detail sheet when tapped.
 */
export default function PlanView({ items, onOpen }) {
  return (
    <main className="page">
      <PlanBoard items={items} onOpen={onOpen} title="The Plan" subtitle="October 2026 to June 2027, month by month." defaultRange="all" expanded />
      <Countdown items={items} onOpen={onOpen} />
    </main>
  );
}
