<script setup lang="ts">
import Cc3CombinedSwitch from './Cc3CombinedSwitch.vue'

/**
 * Строка «название и переключатель» комбинированной версии: название крупно,
 * под ним необязательная серая подпись (баланс, применённый код), справа
 * переключатель, а под строкой — содержимое слота (пояснение, поле ввода).
 *
 * Так выглядят и Coral Wallet, и промокод: один шрифт, один переключатель,
 * одна раскладка. Слот `name-extra` — значок рядом с названием.
 */
defineProps<{
  name: string
  /** Серая подпись под названием; без неё строка только с названием. */
  value?: string
  /** Применено: подпись зелёная. */
  isActive?: boolean
}>()

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <div class="cc3-combined-toggle-row">
    <div class="cc3-combined-toggle-row__head">
      <span class="cc3-combined-toggle-row__info">
        <span class="cc3-combined-toggle-row__name">
          {{ name }}

          <slot name="name-extra" />
        </span>

        <span
          v-if="value"
          class="cc3-combined-toggle-row__value"
          :class="{ 'cc3-combined-toggle-row__value--active': isActive }"
        >
          {{ value }}
        </span>
      </span>

      <Cc3CombinedSwitch v-model="model" :label="name" />
    </div>

    <slot />
  </div>
</template>

<style lang="scss">
.cc3-combined-toggle-row {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-inset-xl);

  &__head {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-xl);
  }

  &__info {
    display: flex;
    flex: 1;
    flex-direction: column;

    min-width: 0;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    @include font('body-lg');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__value {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);

    &--active {
      color: var(--st-content-foreground-color-positive-secondary);
    }
  }
}
</style>
