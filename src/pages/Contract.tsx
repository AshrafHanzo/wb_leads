import { LeadsTemplate } from './LeadsTemplate';

export default function Contract() {
    return (
        <LeadsTemplate
            title="Contract"
            description="Manage contracts and SOWs"
            allowedStageIds={[11]}
        />
    );
}
