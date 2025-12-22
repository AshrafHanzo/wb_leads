import { LeadsTemplate } from './LeadsTemplate';

export default function DataEnrichment() {
    return (
        <LeadsTemplate
            title="Data Enrichment"
            description="Enrich lead data and details"
            allowedStageIds={[2]}
        />
    );
}
