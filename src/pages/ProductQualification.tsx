import { LeadsTemplate } from './LeadsTemplate';

export default function ProductQualification() {
    return (
        <LeadsTemplate
            title="Product Qualification"
            description="Qualify leads for product fit"
            allowedStageIds={[3]}
        />
    );
}
