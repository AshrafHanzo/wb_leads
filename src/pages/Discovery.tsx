import { LeadsTemplate } from './LeadsTemplate';

export default function Discovery() {
    return (
        <LeadsTemplate
            title="Discovery"
            description="Leads in discovery phase"
            allowedStageIds={[7]}
            showMeetingColumns={true}
            meetingType="discovery"
        />
    );
}
