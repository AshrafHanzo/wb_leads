import { LeadsTemplate } from './LeadsTemplate';

export default function Sourcing() {
    return (
        <LeadsTemplate
            title="Sourcing - New Leads"
            description="Manage new leads and sourcing activities"
            allowedStageIds={[1]}
            hideStatusColumn={true}
            hideActions={false}
            hideEditAction={true}
            hideStageFilter={true}
            hideSourceFilter={true}
            showIndustryFilter={true}
            showLOBFilter={true}
            showCityFilter={true}
        />
    );
}
