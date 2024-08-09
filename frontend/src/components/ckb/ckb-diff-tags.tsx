'use client'

import { Trans } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import { compact, sum, uniqBy } from 'lodash-es'
import { memo } from 'react'
import { Flex } from 'styled-system/jsx'

import MoneyIcon from '@/assets/money.svg'
import { CellType, CkbCell } from '@/gql/graphql'
import { scriptToAddress } from '@/lib/ckb/script-to-address'
import { shannonToCKB } from '@/lib/ckb/shannon-to-ckb'
import { formatNumber } from '@/lib/string/format-number'

export const CkbDiffTags = memo(function CkbDiffTags({
  inputs = [],
  outputs = [],
  address,
}: {
  inputs?: CkbCell[] | null
  outputs?: CkbCell[] | null
  address: string
}) {
  if (!inputs) inputs = []
  if (!outputs) outputs = []

  // ckb
  const inputBalance = sum(inputs.filter((x) => scriptToAddress(x.lock) === address).map((x) => x.capacity))
  const outputBalanceWithoutThisAddress = sum(
    outputs.filter((x) => scriptToAddress(x.lock) === address).map((x) => x.capacity),
  )
  const ckbDiff = shannonToCKB(BigNumber(outputBalanceWithoutThisAddress).minus(BigNumber(inputBalance)))

  // xudt
  const allXudt = uniqBy(compact(inputs.map((x) => x.xudtInfo)), (x) => x?.symbol)
  const xudtTags = allXudt.map((xudt) => {
    const balance = inputs
      .filter((x) => scriptToAddress(x.lock) === address && x.xudtInfo?.symbol === xudt?.symbol)
      .reduce((acc, x) => acc.plus(x.xudtInfo?.amount || 0), BigNumber(0))
    const xudtBalanceWithoutThisAddress = outputs
      .filter((x) => scriptToAddress(x.lock) === address && x.xudtInfo?.symbol === xudt?.symbol)
      .reduce((acc, x) => acc.plus(x.xudtInfo?.amount || 0), BigNumber(0))
    const diff = BigNumber(xudtBalanceWithoutThisAddress).minus(BigNumber(balance))
    return !diff.isZero() ? (
      <Flex align="center" py="8px" px="16px" rounded="4px" bg={diff.isGreaterThan(0) ? 'success' : 'danger'}>
        <Trans>
          {diff.isGreaterThan(0) ? '+' : ''}
          {formatNumber(diff, xudt?.decimal)} {xudt?.symbol}
        </Trans>
        <MoneyIcon w="16px" h="16px" ml="6px" />
      </Flex>
    ) : null
  })

  // dob
  const inputDobs = inputs.filter(
    (x) => (x.cellType === CellType.Dob || x.cellType === CellType.Mnft) && scriptToAddress(x.lock) === address,
  )
  const outputDobs = outputs.filter(
    (x) => (x.cellType === CellType.Dob || x.cellType === CellType.Mnft) && scriptToAddress(x.lock) === address,
  )
  const dobDiff = BigNumber(outputDobs.length).minus(inputDobs.length)

  return (
    <>
      {!ckbDiff.isZero() ? (
        <Flex align="center" py="8px" px="16px" rounded="4px" bg={ckbDiff.isGreaterThan(0) ? 'success' : 'danger'}>
          <Trans>
            {ckbDiff.isGreaterThan(0) ? '+' : ''}
            {formatNumber(ckbDiff)} CKB
          </Trans>
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
