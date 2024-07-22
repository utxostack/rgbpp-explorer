import { t } from '@lingui/macro'
import { HStack } from 'styled-system/jsx'

import { getI18nFromHeaders } from '@/app/[lang]/appRouterI18n'
import LinkOutlineIcon from '@/assets/link-outline.svg'
import { AgoTimeFormatter } from '@/components/ago-time-formatter'
import { LayerType } from '@/components/layer-type'
import { Table } from '@/components/ui/primitives'
import { formatCkbTxHash } from '@/lib/address/format-ckb-tx-hash'

export function LastRgbppTxnsTable() {
  const i18n = getI18nFromHeaders()
  return (
    <Table.Root>
      <Table.Head>
        <Table.Row>
          <Table.Header>{t(i18n)`Tx hash`}</Table.Header>
          <Table.Header>{t(i18n)`Type`}</Table.Header>
          <Table.Header>{t(i18n)`Amount`}</Table.Header>
          <Table.Header>{t(i18n)`Time`}</Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {new Array(10).fill(0).map((_, i) => (
          <Table.Row key={i}>
            <Table.Cell>
              <HStack gap={3} color="text.link">
                <LinkOutlineIcon w="36px" h="36px" />
                {formatCkbTxHash('0xb9dbfa7fe5eca1e2799760ed257de032437aed8794959a49e8fa225120454129')}
              </HStack>
            </Table.Cell>
            <Table.Cell>
              <LayerType type="l1-l2" />
            </Table.Cell>
            <Table.Cell>
              <b>0.12345678</b> xUDT
            </Table.Cell>
            <Table.Cell w="165px">
              <AgoTimeFormatter time={1721465709784} tooltip />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
