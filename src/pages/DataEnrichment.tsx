import { LeadsTemplate } from './LeadsTemplate';

export default function DataEnrichment() {
    return (
        <LeadsTemplate
            title="Data Enrichment"
            description="Enrich lead data and details"
            allowedStageIds={[2]}
            showDEColumn={true}
            hideGeneratedBy={true}
            hideSourceFrom={true}
            hideStatusColumn={true}
            hideStageFilter={true}
            hideSourceFilter={true}
            showIndustryFilter={true}
            showLOBFilter={true}
            showCityFilter={true}
        />
    );
}
