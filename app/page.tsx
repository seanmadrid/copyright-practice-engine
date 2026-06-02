import { Practice } from "@/components/practice";
import { DOCTRINES } from "@/lib/data";
import { EXAMPLE_SOURCES } from "@/data/example-sources";

export default function Page() {
  return <Practice doctrines={DOCTRINES} examples={EXAMPLE_SOURCES} />;
}
