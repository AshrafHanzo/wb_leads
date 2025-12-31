import { LeadsTemplate } from './LeadsTemplate';

export default function Demo() {
    return (
        <LeadsTemplate
            title="Demo"
            description="Leads scheduled for demo"
            allowedStageIds={[6]}
            showMeetingColumns={true}
            meetingType="demo"
            showIndustryFilter={true}
            showLOBFilter={true}
            showCityFilter={true}
            hideStageFilter={true}
            hideSourceFilter={true}
            hideGeneratedBy={true}
        />
    );
}
