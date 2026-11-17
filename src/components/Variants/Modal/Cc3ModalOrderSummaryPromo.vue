<script setup lang="ts">
import { computed } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

import Cc3CombinedInput from '../Combined/Cc3CombinedInput.vue'

/**
 * Поле промокода: ввод и «Применить», а после применения — код и «Удалить».
 *
 * Вынесено из тела сводки, потому что в комбинированной версии промокод
 * стоит не в самой сводке, а в отдельной карточке под ней. Состояние общее
 * для всех мест (useCheckout), так что два поля на странице показывают одно.
 *
 * Флаг `floating` рисует поле с подписью внутри, как остальные поля
 * комбинированной версии; без него — прежнее поле с подсказкой.
 */
defineProps<{
  floating?: boolean
}>()

const { t } = useStand()
const { promoCode, appliedPromo, promoError, applyPromo, removePromo, clearPromoError } =
  useCheckout()

const text = computed(() => ({
  placeholder: t('summary.promoPlaceholder'),
  apply: t('common.apply'),
  applied: appliedPromo.value ? t('summary.promoApplied', { code: appliedPromo.value.code }) : '',
  remove: t('summary.promoRemove'),
  error: promoError.value === 'expired' ? t('summary.promoExpired') : t('summary.promoInvalid'),
}))

const isInvalid = computed(() => Boolean(promoError.value))
</script>

<template>
  <div class="cc3-modal-order-summary-promo">
    <!-- Поле с подписью внутри: код применён — показываем сообщение и «Удалить». -->
    <template v-if="floating">
      <Cc3CombinedInput
        v-if="appliedPromo"
        :model-value="text.applied"
        :label="text.placeholder"
        readonly
      >
        <template #action>
          <button type="button" class="cc3-modal-order-summary-promo__apply" @click="removePromo">
            {{ text.remove }}
          </button>
        </template>
      </Cc3CombinedInput>

      <Cc3CombinedInput
        v-else
        v-model="promoCode"
        :label="text.placeholder"
        :invalid="isInvalid"
        @input="clearPromoError"
        @keydown.enter="applyPromo"
      >
        <template #action>
          <button
            type="button"
            class="cc3-modal-order-summary-promo__apply"
            :disabled="!promoCode"
            @click="applyPromo"
          >
            {{ text.apply }}
          </button>
        </template>
      </Cc3CombinedInput>

      <p v-if="promoError && !appliedPromo" class="cc3-modal-order-summary-promo__error" role="alert">
        {{ text.error }}
      </p>
    </template>

    <template v-else>
      <div v-if="appliedPromo" class="cc3-modal-order-summary-promo__field">
        <span class="cc3-modal-order-summary-promo__applied">{{ text.applied }}</span>

        <button type="button" class="cc3-modal-order-summary-promo__apply" @click="removePromo">
          {{ text.remove }}
        </button>
      </div>

      <template v-else>
        <div
          class="cc3-modal-order-summary-promo__field"
          :class="{ 'cc3-modal-order-summary-promo__field--invalid': promoError }"
        >
          <input
            v-model="promoCode"
            type="text"
            :placeholder="text.placeholder"
            class="cc3-modal-order-summary-promo__input"
            @input="clearPromoError"
            @keydown.enter="applyPromo"
          />

          <button
            type="button"
            class="cc3-modal-order-summary-promo__apply"
            :disabled="!promoCode"
            @click="applyPromo"
          >
            {{ text.apply }}
          </button>
        </div>

        <p v-if="promoError" class="cc3-modal-order-summary-promo__error" role="alert">
          {{ text.error }}
        </p>
      </template>
    </template>
  </div>
</template>

<style lang="scss">
.cc3-modal-order-summary-promo {
  // Рамка у обёртки, а не у input: кнопка «Применить» лежит внутри поля.
  &__field {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    padding: 0 var(--st-global-distance-space-inset-xl);
    height: 44px;

    background-color: var(--st-interaction-background-color-ghost-normal);
    border: 2px solid var(--st-interaction-border-color-neutral-normal);
    border-radius: var(--st-global-radius-sm);

    &:focus-within {
      border-color: var(--st-action-background-color-positive-normal);
    }
  }

  &__field--invalid,
  &__field--invalid:focus-within {
    border-color: var(--st-content-border-color-negative-explicit);
  }

  &__applied {
    flex: 1;
    min-width: 0;

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__error {
    margin: var(--st-global-distance-space-inset-sm) 0 0;

    @include font('body-sm');

    color: var(--st-content-foreground-color-negative-primary);
  }

  &__input {
    flex: 1;
    min-width: 0;

    padding: 0;
    height: 100%;

    font-family: inherit;

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-primary);
    background: none;
    border: none;

    &::placeholder {
      color: var(--st-content-foreground-color-neutral-tetriary);
    }

    &:focus {
      outline: none;
    }
  }

  &__apply {
    flex-shrink: 0;

    padding: 0;

    font-family: inherit;

    @include font('label-sm');

    color: var(--st-action-foreground-color-neutral-normal);
    text-decoration: underline;
    background: none;
    border: none;
    cursor: pointer;

    &:disabled {
      color: var(--st-content-foreground-color-neutral-tetriary);
      cursor: not-allowed;
    }
  }
}
</style>
