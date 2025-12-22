import { LeadsTemplate } from './LeadsTemplate';

export default function ProposalCommercials() {
    return (
        <LeadsTemplate
            title="Proposal & Commercials"
            description="Manage proposals and commercial discussions"
            allowedStageIds={[9]}
        />
    );
}
