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

    // На сером фоне карточки поле промокода белое, чтобы читалось как поле.
    .cc3-modal-order-summary-promo__field {
      background-color: var(--st-content-background-color-default-solid-normal);
    }
  }
}
</style>
