<script setup lang="ts">
import { computed } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

/**
 * Строка «Итого» отдельным блоком. Нужна, когда скидки стоят в той же карточке
 * над итогом: тогда сумма идёт последней, как в чеке, а не посреди карточки.
 * Вид тот же, что у строки итога в теле сводки.
 */
const { t } = useStand()
const { summary } = useCheckout()

const text = computed(() => ({
  total: t('summary.total'),
}))
</script>

<template>
  <dl class="cc3-modal-order-summary-body__rows cc3-combined-summary-total">
    <div class="cc3-modal-order-summary-body__row cc3-modal-order-summary-body__row--total">
      <dt>{{ text.total }}</dt>
      <dd>{{ summary.totalFormatRounded }}</dd>
    </div>
  </dl>
</template>
