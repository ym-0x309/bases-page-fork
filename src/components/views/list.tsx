import type { FullSlug } from "@quartz-community/types";
import { transformLink } from "@quartz-community/utils";
import type { ComponentChild } from "preact";
import { i18n } from "../../i18n";
import type { ViewRenderer, ViewTypeRegistration } from "../../types";
import {
  getColumns,
  isEmptyValue,
  isTagProperty,
  renderCellValue,
  renderTagLinks,
  resolveEntryPropertyValue,
} from "../shared/cell";

function formatMessage(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template,
  );
}

const ListView: ViewRenderer = ({
  entries,
  view,
  basesData,
  total,
  locale,
  slug,
  allSlugs,
  linkResolution,
}) => {
  const columns = getColumns(view, basesData, entries);
  const localeStrings = i18n(locale).components.bases;
  const transformOpts = { strategy: linkResolution, allSlugs: allSlugs as FullSlug[] };

  return (
    <div class="bases-list-wrapper">
      <div class="bases-view-meta">
        {formatMessage(localeStrings.showingCount, {
          count: entries.length,
          total,
        })}
      </div>
      <div class="bases-list-group">
        <div class="bases-list-group-list">
          {entries.map((entry) => {
            const ctx = { slug, allSlugs, linkResolution };
            const primaryColumn = columns[0] ?? "file.name";
            const secondaryColumns = columns.slice(1);

            const primaryRawValue = resolveEntryPropertyValue(primaryColumn, entry);

            const primaryValue: ComponentChild =
              primaryColumn === "file.name" ? (
                <a
                  href={transformLink(slug as FullSlug, entry.slug, transformOpts)}
                  class="internal internal-link"
                  data-slug={entry.slug}
                >
                  {entry.title}
                </a>
              ) : isTagProperty(primaryColumn) ? (
                renderTagLinks(primaryRawValue, ctx)
              ) : (
                renderCellValue(primaryRawValue, ctx)
              );

            const secondaryItems: ComponentChild[] = [];
            for (const column of secondaryColumns) {
              const value = resolveEntryPropertyValue(column, entry);
              if (isEmptyValue(value)) continue;
              secondaryItems.push(
                <span class="bases-list-property">
                  <span class="bases-rendered-value">
                    {isTagProperty(column)
                      ? renderTagLinks(value, ctx)
                      : renderCellValue(value, ctx)}
                  </span>
                </span>,
              );
            }

            return (
              <div class="bases-list-item">
                <div class="bases-list-item-properties">
                  <span class="bases-list-property">
                    <span class="list-bullet">-</span>
                    <span class="bases-rendered-value">{primaryValue}</span>
                  </span>
                  {secondaryItems.map((item) => (
                    <>
                      <span class="bases-list-separator">, </span>
                      {item}
                    </>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const listViewRegistration: ViewTypeRegistration = {
  id: "list",
  name: "List",
  icon: "list",
  render: ListView,
};

export { ListView };
