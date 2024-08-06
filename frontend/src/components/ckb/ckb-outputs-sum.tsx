'use client'

import { Trans } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import { compact, sum, uniqBy } from 'lodash-es'
import { memo } from 'react'
import { Flex } from 'styled-system/jsx'

import MoneyIcon from '@/assets/money.svg'
import { CellType, CkbCell } from '@/gql/graphql'
import { shannonToCKB } from '@/lib/ckb/shannon-to-ckb'
import { formatNumber } from '@/lib/string/format-number'

export const CkbOutputsSum = memo(function CkbDiffTags({ outputs = [] }: { outputs?: CkbCell[] }) {
  const outputBalanceWithoutThisAddress = sum(outputs.map((x) => x.capacity))
  const ckbDiff = shannonToCKB(BigNumber(outputBalanceWithoutThisAddress))

  // xudt
  const allXudt = uniqBy(compact(outputs.map((x) => x.xudtInfo)), (x) => x?.symbol)
  const xudtTags = allXudt.map((xudt) => {
    const balance = outputs
      .filter((x) => x.xudtInfo?.symbol === xudt?.symbol)
      .reduce((acc, x) => acc.plus(x.xudtInfo?.amount || 0), BigNumber(0))
    console.log(
      xudt?.symbol,
      outputs.filter((x) => x.xudtInfo?.symbol === xudt?.symbol),
    )
    return !balance.isZero() ? (
      <Flex align="center" bg="brand" py="8px" px="16px" rounded="4px">
        <Trans>
          {formatNumber(balance, xudt?.decimal)} {xudt?.symbol}
        </Trans>
        <MoneyIcon w="16px" h="16px" ml="6px" />
      </Flex>
    ) : null
  })

  // dob
  const outputDobs = outputs.filter((x) => x.cellType === CellType.Dob || x.cellType === CellType.Mnft)
  const dobDiff = BigNumber(outputDobs.length)

  return (
    <>
      {!ckbDiff.isZero() ? (
        <Flex align="center" bg="brand" py="8px" px="16px" rounded="4px">
          <Trans>{formatNumber(ckbDiff)} CKB</Trans>
          <MoneyIcon w="16px" h="16px" ml="6px" />
        </Flex>
      ) : null}
      {xudtTags}
      {!dobDiff.isZero() ? (
        <Flex align="center" bg="brand" py="8px" px="16px" rounded="4px">
          <Trans>{formatNumber(dobDiff)} DOB</Trans>
          <MoneyIcon w="16px" h="16px" ml="6px" />
        </Flex>
      ) : null}
    </>
  )
})
