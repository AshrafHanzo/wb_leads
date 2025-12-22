import { LeadsTemplate } from './LeadsTemplate';

export default function Telecalling() {
    return (
        <LeadsTemplate
            title="Telecalling"
            description="Leads in telecalling phase"
            allowedStageIds={[4]}
        />
    );
}
