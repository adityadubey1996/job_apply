import React from "react";

import { Label } from "@/components/ui/label";
import renderTooltip from "./renderToolTip";

function LabelWrapper({ label, htmlFor, tooltipText }) {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {renderTooltip({ tooltipText })}
    </div>
  );
}

export default LabelWrapper;
