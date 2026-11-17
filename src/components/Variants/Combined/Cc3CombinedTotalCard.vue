<script setup lang="ts">
import Cc3ModalOrderSummaryBody from '../Modal/Cc3ModalOrderSummaryBody.vue'

/**
 * Серая карточка с суммами внизу страницы на телефоне и планшете: строки и
 * итог. Товары стоят над ней отдельным блоком, кошелёк и промокод — в своей
 * карточке ниже. С двух колонок её заменяет сводка справа.
 */
</script>

<template>
  <section class="cc3-combined-total-card">
    <Cc3ModalOrderSummaryBody hide-items hide-promo />
  </section>
</template>

<style lang="scss">
.cc3-combined-total-card {
  @include cc3-combined-summary-card;
}
</style>
