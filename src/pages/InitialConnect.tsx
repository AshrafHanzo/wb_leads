import { LeadsTemplate } from './LeadsTemplate';

export default function InitialConnect() {
    return (
        <LeadsTemplate
            title="Initial Connect"
            description="Leads in initial contact phase"
            allowedStageIds={[5]}
            showMeetingColumns={true}
            meetingType="initial_connect"
            showIndustryFilter={true}
            showLOBFilter={true}
            showCityFilter={true}
            hideStageFilter={true}
            hideSourceFilter={true}
            hideGeneratedBy={true}
        />
    );
}
