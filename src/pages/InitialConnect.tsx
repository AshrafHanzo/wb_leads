import { LeadsTemplate } from './LeadsTemplate';

export default function InitialConnect() {
    return (
        <LeadsTemplate
            title="Initial Connect"
            description="Leads in initial contact phase"
            allowedStageIds={[5]}
        />
    );
}
