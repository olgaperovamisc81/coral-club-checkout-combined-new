<script setup lang="ts">
import Cc3ModalOrderSummaryPromo from '../Modal/Cc3ModalOrderSummaryPromo.vue'
import Cc3CombinedWallet from './Cc3CombinedWallet.vue'

/**
 * Отдельная серая карточка под сводкой: Coral Wallet и промокод. Это два
 * способа уменьшить сумму, и они стоят отдельно от самой сводки, как вторая
 * карточка в чекаутах с бонусами и рассрочкой. Блок кошелька сам прячется,
 * когда кошелька у человека нет, и тогда в карточке остаётся один промокод.
 */
</script>

<template>
  <section class="cc3-combined-extras-card">
    <Cc3CombinedWallet />

    <div class="cc3-combined-extras-card__promo">
      <Cc3ModalOrderSummaryPromo />
    </div>
  </section>
</template>

<style lang="scss">
.cc3-combined-extras-card {
  @include cc3-combined-summary-card;

  &__promo {
    padding: 0 var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl);

    // Поле промокода по новому образцу: рамка 1px, скругление крупнее.
    .cc3-modal-order-summary-promo__field {
      border-width: 1px;
      border-radius: var(--st-global-radius-xl);
    }

    // «Применить» ярче: цвет действий версии и пунктир под текстом, вместо
    // серого подчёркивания. Пока код не введён, кнопка бледнее, но не серая.
    .cc3-modal-order-summary-promo__apply {
      color: var(--st-action-foreground-color-positive-normal);
      text-decoration-style: dotted;
      text-underline-offset: 4px;

      &:disabled {
        color: var(--st-action-foreground-color-positive-normal);
        opacity: 0.56;
      }
    }
  }
}
</style>
