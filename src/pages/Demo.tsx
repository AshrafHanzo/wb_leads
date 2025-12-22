import { LeadsTemplate } from './LeadsTemplate';

export default function Demo() {
    return (
        <LeadsTemplate
            title="Demo"
            description="Leads scheduled for demo"
            allowedStageIds={[6]}
        />
    );
}
