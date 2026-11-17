<script setup lang="ts">
import { computed } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

/**
 * Товары заказа: миниатюры и строка «N товаров, M баллов».
 *
 * Вынесено из тела сводки, потому что в комбинированной версии товары стоят
 * не внутри серой карточки с суммами, а отдельным блоком над ней.
 */
const { t } = useStand()
const { summary, orderProductsPreview } = useCheckout()

const text = computed(() => ({
  itemsPoints: t('summary.itemsPoints', {
    count: summary.value.itemsCount,
    points: summary.value.points,
  }),
}))
</script>

<template>
  <div class="cc3-modal-order-summary-items">
    <!--
      Раньше превью было кнопкой со стрелкой «раскрыть список товаров», но
      обработчика у неё не было: человек жал и ничего не происходило. Состав
      заказа теперь виден целиком — три позиции, — и раскрывать нечего.
    -->
    <div class="cc3-modal-order-summary-items__preview">
      <span class="cc3-modal-order-summary-items__thumbs">
        <span
          v-for="product in orderProductsPreview"
          :key="product.id"
          class="cc3-modal-order-summary-items__thumb"
        >
          <img
            v-if="product.thumbImage"
            :src="product.thumbImage"
            :alt="product.name"
            class="cc3-modal-order-summary-items__thumb-img"
          />
        </span>
      </span>
    </div>

    <p class="cc3-modal-order-summary-items__count">
      {{ text.itemsPoints }}
    </p>
  </div>
</template>

<style lang="scss">
.cc3-modal-order-summary-items {
  &__preview {
    display: flex;
    align-items: center;

    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);
    width: 100%;
  }

  &__thumbs {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-2xl);
  }

  &__thumb {
    display: flex;
    flex-shrink: 0;

    width: 64px;
    height: 64px;

    background-color: #f6f6f6;
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-x);
  }

  &__thumb-img {
    width: 100%;
    height: 100%;

    border-radius: var(--st-global-radius-x);
    object-fit: cover;
  }

  &__count {
    margin: 0;
    padding: 0 var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl);

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-secondary);
  }
}
</style>
