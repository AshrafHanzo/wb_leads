import { LeadsTemplate } from './LeadsTemplate';

export default function POC() {
    return (
        <LeadsTemplate
            title="POC"
            description="Proof of Concept phase"
            allowedStageIds={[8]}
        />
    );
}
