import { LeadsTemplate } from './LeadsTemplate';

export default function SigningOff() {
    return (
        <LeadsTemplate
            title="Signing Off"
            description="Leads in signing off phase"
            allowedStageIds={[12]}
        />
    );
}
