import { LeadsTemplate } from './LeadsTemplate';

export default function ClosedWon() {
    return (
        <LeadsTemplate
            title="Closed Won"
            description="Successfully closed deals"
            allowedStageIds={[11]}
            showWonColumns={true}
        />
    );
}
