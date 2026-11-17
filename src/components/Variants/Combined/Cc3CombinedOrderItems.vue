<script setup lang="ts">
import { computed } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

/**
 * Товары заказа в сводке: четыре равные плитки в ряд и под ними строка
 * «Товаров: N. Баллов: M.».
 *
 * Если позиций не больше четырёх, показываются все. Если больше — три
 * первые и четвёртая плитка «+N» с числом остальных. У позиции, которую
 * взяли больше одной штуки, в углу плитки стоит бейдж с количеством.
 *
 * N в строке — число штук, а не позиций: шесть позиций с одной купленной
 * дважды дают «7». А «+N» считает позиции, потому что плиток прячется ровно
 * столько.
 */
const { t } = useStand()
const { summary, orderProductsFormat } = useCheckout()

/** Сколько плиток помещается в ряд, считая плитку «+N». */
const TILES = 4

const hasMore = computed(() => orderProductsFormat.value.length > TILES)

const tiles = computed(() =>
  hasMore.value ? orderProductsFormat.value.slice(0, TILES - 1) : orderProductsFormat.value,
)

const moreCount = computed(() => orderProductsFormat.value.length - tiles.value.length)

const text = computed(() => ({
  count: t('summary.itemsPointsCompact', {
    count: summary.value.itemsCount,
    points: summary.value.points,
  }),
}))
</script>

<template>
  <div class="cc3-combined-order-items">
    <div class="cc3-combined-order-items__tiles">
      <span v-for="product in tiles" :key="product.id" class="cc3-combined-order-items__tile">
        <img
          v-if="product.thumbImage"
          :src="product.thumbImage"
          :alt="product.name"
          class="cc3-combined-order-items__image"
        />

        <span v-if="product.quantity > 1" class="cc3-combined-order-items__badge">
          {{ product.quantity }}
        </span>
      </span>

      <span
        v-if="hasMore"
        class="cc3-combined-order-items__tile cc3-combined-order-items__tile--more"
      >
        +{{ moreCount }}
      </span>
    </div>

    <p class="cc3-combined-order-items__count">{{ text.count }}</p>
  </div>
</template>

<style lang="scss">
.cc3-combined-order-items {
  &__tiles {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);
  }

  // Плитка тянется по ширине ряда, чуть шире, чем выше (как на референсе,
  // примерно 296×256): на узком телефоне около 65×56, в правой колонке
  // десктопа крупнее.
  &__tile {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    aspect-ratio: 7 / 6;

    background-color: var(--st-content-background-color-default-solid-normal);
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-md);

    // Плитка «+N» без картинки: число крупно и приглушённо, как подпись.
    &--more {
      @include font('heading-xs');

      color: var(--st-content-foreground-color-neutral-secondary);
    }
  }

  // Серый фон (#f6f6f6) вшит в файлы картинок, поэтому их осветляем до
  // белого. Нормально — отдать картинки с прозрачным фоном, и тогда фильтр не
  // нужен.
  &__image {
    width: 100%;
    height: 100%;

    border-radius: var(--st-global-radius-md);
    filter: brightness(1.04);
    object-fit: contain;
  }

  // Бейдж количества в правом верхнем углу плитки, чуть выступает за её край.
  &__badge {
    position: absolute;
    top: calc(-1 * var(--st-global-distance-space-inset-md));
    right: calc(-1 * var(--st-global-distance-space-inset-md));

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0 var(--st-global-distance-space-inset-md);
    min-width: 24px;
    height: 24px;

    @include font('label-sm');

    color: var(--st-action-foreground-color-onprimary-normal);
    background-color: var(--st-action-background-color-positive-normal);
    border-radius: var(--st-global-radius-md);
  }

  &__count {
    margin: 0;
    padding: 0 var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl);

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }
}
</style>
