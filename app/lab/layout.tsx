import "./lab-tokens.css";
import LabSwitcher from "@/components/LabSwitcher";
import { labs } from "@/lib/lab";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="labRoot">
      {children}
      <LabSwitcher designs={labs} />
    </div>
  );
}
