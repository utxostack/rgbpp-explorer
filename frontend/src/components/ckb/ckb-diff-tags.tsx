'use client'

import { Trans } from '@lingui/macro'
import BigNumber from 'bignumber.js'
import { compact, sum } from 'lodash-es'
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
  fee = 0,
  address,
}: {
  inputs?: CkbCell[]
  outputs?: CkbCell[]
  fee?: BigNumber.Value
  address: string
}) {
  // ckb
  const inputBalance = sum(inputs.filter((x) => scriptToAddress(x.lock) === address).map((x) => x.capacity))
  const outputBalanceWithoutThisAddress = sum(
    outputs.filter((x) => scriptToAddress(x.lock) === address).map((x) => x.capacity),
  )
  const ckbDiff = shannonToCKB(BigNumber(outputBalanceWithoutThisAddress).minus(BigNumber(inputBalance).plus(fee)))

  // xudt
  const allXudt = compact(inputs.map((x) => x.xudtInfo))
  const xudtTags = allXudt.map((xudt) => {
    const balance = sum(
      compact(
        inputs
          .filter((x) => scriptToAddress(x.lock) === address && x.xudtInfo?.symbol === xudt?.symbol)
          .map((x) => x.xudtInfo?.amount),
      ),
    )
    const xudtBalanceWithoutThisAddress = sum(
      compact(
        outputs
          .filter((x) => scriptToAddress(x.lock) === address && x.xudtInfo?.symbol === xudt?.symbol)
          .map((x) => x.xudtInfo?.amount),
      ),
    )
    const diff = BigNumber(xudtBalanceWithoutThisAddress).minus(BigNumber(balance))
    return !diff.isZero() ? (
      <Flex align="center" bg="brand" py="8px" px="16px" rounded="4px">
        <Trans>
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
