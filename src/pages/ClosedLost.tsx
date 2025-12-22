import { LeadsTemplate } from './LeadsTemplate';

export default function ClosedLost() {
    return (
        <LeadsTemplate
            title="Closed Lost"
            description="Lost opportunities"
            allowedStageIds={[12]}
        />
    );
}
