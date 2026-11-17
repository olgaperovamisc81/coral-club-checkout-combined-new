<script setup lang="ts">
import { computed } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useStand } from '@/stand/composables/useStand'

import Cc3CombinedInput from '../Cc3CombinedInput.vue'

/**
 * Строка поиска адреса под картой самовывоза. Выглядит как поле с подписью
 * внутри, но печатать в ней нельзя: нажатие открывает шторку поиска, где
 * курсор уже стоит в поле, а подсказки идут списком. Так на маленьком экране клавиатура
 * не закрывает карту, а подсказкам хватает места.
 *
 * Выбранный адрес остаётся в строке, чтобы было видно, от чего считаются
 * ближайшие пункты.
 */
defineProps<{
  /** Адрес, выбранный в поиске; пока не выбран — строка пустая. */
  address: string
}>()

const emit = defineEmits<{
  open: []
}>()

const { t } = useStand()

const text = computed(() => ({
  placeholder: t('concept.common.findAddress'),
}))
</script>

<template>
  <Cc3CombinedInput
    :model-value="address"
    :label="text.placeholder"
    readonly
    :aria-label="text.placeholder"
    @focus="emit('open')"
  >
    <template #prefix>
      <Cc3Icon name="search-md" :size="20" />
    </template>
  </Cc3CombinedInput>
</template>
