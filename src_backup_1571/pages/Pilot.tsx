import { LeadsTemplate } from './LeadsTemplate';

export default function Pilot() {
    return (
        <LeadsTemplate
            title="Pilot"
            description="Manage pilot projects"
            allowedStageIds={[10]}
        />
    );
}
