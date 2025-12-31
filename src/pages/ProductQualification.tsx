import { LeadsTemplate } from './LeadsTemplate';

export default function ProductQualification() {
    return (
        <LeadsTemplate
            title="Product Qualification"
            description="Qualify leads for specific products"
            allowedStageIds={[3]}
            showProductSelection={true}
            hideStatusColumn={true}
            hideGeneratedBy={true}
            hideStageFilter={true}
            hideSourceFilter={true}
            showIndustryFilter={true}
            showLOBFilter={true}
            showCityFilter={true}
            showProductFilter={true}
        />
    );
}
