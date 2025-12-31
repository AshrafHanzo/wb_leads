import { LeadsTemplate } from './LeadsTemplate';

export default function Telecalling() {
    return (
        <LeadsTemplate
            title="Telecalling"
            description="Leads in telecalling phase"
            allowedStageIds={[4]}
            showTelecallingColumns={true}
            hideGeneratedBy={true}
            showQuickCallActions={true}
            hideStageFilter={true}
            hideSourceFilter={true}
            showIndustryFilter={true}
            showLOBFilter={true}
            showCityFilter={true}
            showOutcomeFilter={true}
            showCallStats={true}
        />
    );
}
