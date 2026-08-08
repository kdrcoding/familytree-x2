import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Baby, ChevronDown, ChevronUp, Heart, UserRoundPlus } from 'lucide-react';
import { useFamily } from '../../context/FamilyContext';
import { usePrivacy } from '../../hooks/usePrivacy';
import { useT } from '../../i18n/useT';
import { lifespan } from '../../utils/dates';
import { fullName } from '../../utils/family';
import type { FamilyPerson } from '../../types/family';
import { Avatar } from '../../components/Avatar';
import { CARD_H, CARD_W } from './layout';
import type { PersonFlowNode } from './layout';
import { useTreeInteraction } from './TreeInteractionContext';

/** Soft accents — readable, not loud. */
const GENDER_ACCENT = {
  male: 'border-l-teal-500/70 dark:border-l-teal-500/50',
  female: 'border-l-emerald-500/70 dark:border-l-emerald-400/50',
  unspecified: 'border-l-stone-400 dark:border-l-stone-500',
};

const HANDLE = '!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-0 !bg-transparent';

/**
 * Compact labels that always fit the card. Never use displayName (First "Nick" Last)
 * — that string is what was spilling out of the box.
 */
function treeCardLabels(person: FamilyPerson): { title: string; line2?: string; line3?: string } {
  const nick = person.nickname?.trim();
  const first = person.firstName?.trim() || '';
  const last = person.lastName?.trim() || '';

  if (nick) {
    // Short nickname is the hero; legal names go on clipped lines below.
    return {
      title: nick,
      line2: first || undefined,
      line3: last || undefined,
    };
  }
  if (first && last) return { title: first, line2: last };
  return { title: first || last || fullName(person) };
}

function PersonNodeComponent({ data }: NodeProps<PersonFlowNode>) {
  const { getPerson, getLabel } = useFamily();
  const privacy = usePrivacy();
  const t = useT();
  const { onOpen, onToggleCollapse, onQuickAdd, editMode } = useTreeInteraction();
  const person = getPerson(data.personId);
  if (!person) return null;

  const name = fullName(person);
  const { title, line2, line3 } = treeCardLabels(person);
  const years = privacy.showBirthDate()
    ? lifespan(
        person.birthDate,
        privacy.showDeathDate() ? person.deathDate : undefined,
        person.isDeceased,
        t('common.bornAbbr'),
        t('common.diedAbbr'),
      )
    : person.isDeceased
      ? t('common.deceasedShort')
      : '';
  // Prefer years; otherwise a role label only when we have spare line space.
  const meta = years || (!line2 && !line3 ? getLabel(person) : '');

  return (
    <div
      style={{ width: CARD_W, height: CARD_H }}
      className="relative"
    >
      <Handle type="target" position={Position.Top} id="top" className={HANDLE} />
      <Handle type="target" position={Position.Left} id="left" className={HANDLE} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE} />

      <button
        type="button"
        onClick={() => onOpen(person.id)}
        aria-label={t('tree.openDetails', { name })}
        title={name}
        className={`tree-person-card flex h-full w-full items-center gap-2 overflow-hidden rounded-xl border border-l-[3px] px-2 py-1.5 text-left shadow-sm ring-1 ring-emerald-900/5 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500 dark:ring-white/5 ${
          GENDER_ACCENT[person.gender]
        } ${
          person.isDeceased
            ? 'border-dashed border-stone-400/80 opacity-90 dark:border-stone-600'
            : 'border-emerald-200/80 dark:border-stone-700'
        }`}
      >
        <Avatar person={person} size="xs" />
        <span className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
          <span className="tree-person-name block w-full truncate text-[13px] font-semibold leading-tight text-stone-800 dark:text-stone-100">
            {title}
          </span>
          {line2 ? (
            <span className="tree-person-meta mt-0.5 block w-full truncate text-[11px] font-medium leading-tight text-stone-600 dark:text-stone-300">
              {line2}
            </span>
          ) : null}
          {line3 ? (
            <span className="tree-person-meta block w-full truncate text-[11px] font-medium leading-tight text-stone-600 dark:text-stone-300">
              {line3}
            </span>
          ) : null}
          {meta ? (
            <span className="tree-person-meta mt-0.5 block w-full truncate text-[10px] leading-tight text-stone-500 dark:text-stone-400">
              {meta}
            </span>
          ) : null}
        </span>
      </button>

      {editMode && (
        <>
          <button
            type="button"
            className="quick-add absolute -right-3 top-1/2 z-10 -translate-y-1/2"
            title={t('tree.quickSpouse', { name })}
            aria-label={t('tree.quickSpouse', { name })}
            onClick={(event) => {
              event.stopPropagation();
              onQuickAdd('spouse', person.id);
            }}
          >
            <Heart className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            className="quick-add absolute -bottom-3 right-4 z-10"
            title={t('tree.quickChild', { name })}
            aria-label={t('tree.quickChild', { name })}
            onClick={(event) => {
              event.stopPropagation();
              onQuickAdd('child', person.id);
            }}
          >
            <Baby className="h-3.5 w-3.5" aria-hidden />
          </button>
          {person.parentIds.length === 0 && (
            <button
              type="button"
              className="quick-add absolute -top-3 left-1/2 z-10 -translate-x-1/2"
              title={t('tree.quickParent', { name })}
              aria-label={t('tree.quickParent', { name })}
              onClick={(event) => {
                event.stopPropagation();
                onQuickAdd('parent', person.id);
              }}
            >
              <UserRoundPlus className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </>
      )}

      {data.collapsible && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleCollapse(person.id);
          }}
          aria-label={
            data.collapsed
              ? t('tree.expandBranch', { n: data.hiddenCount })
              : t('tree.collapseBranch')
          }
          className="tree-branch-toggle absolute -bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-emerald-200/90 bg-[var(--tree-card-bg,#f3f7f4)] px-1.5 py-0.5 text-[10px] font-semibold text-stone-600 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
        >
          {data.collapsed ? (
            <>
              <ChevronDown className="h-3 w-3" aria-hidden />
              {data.hiddenCount}
            </>
          ) : (
            <ChevronUp className="h-3 w-3" aria-hidden />
          )}
        </button>
      )}
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
