import { memo } from 'react'
import { Box, Flex, Text, HStack } from '@chakra-ui/react'
import { T, FONTS, contrast } from '../theme/tokens'

// Kartu satu tema: nama + pratinjau jendela terminal + 16 warna + keterangan singkat.
// Warna di dalam pratinjau datang dari BERKAS TEMA (data), bukan dari token UI.

function Swatches({ palette }) {
  return (
    <Flex h="10px" borderRadius="3px" overflow="hidden" gap="1px">
      {palette.map((c, i) => (
        <Box key={i} flex="1" bg={c} />
      ))}
    </Flex>
  )
}

function Preview({ t }) {
  const p = t.palette
  return (
    <Box
      bg={t.background}
      borderRadius="7px"
      border="1px solid"
      borderColor={T.line}
      px="10px"
      py="8px"
      fontFamily={FONTS.mono}
      fontSize="11px"
      lineHeight="1.55"
      overflow="hidden"
    >
      <Box whiteSpace="nowrap">
        <Box as="span" color={p[2]}>
          you
        </Box>
        <Box as="span" color={t.foreground}>
          :
        </Box>
        <Box as="span" color={p[4]}>
          ~/code
        </Box>
        <Box as="span" color={t.foreground}>
          {' $ '}
        </Box>
        <Box as="span" color={p[6]}>
          git
        </Box>
        <Box as="span" color={t.foreground}>
          {' status'}
        </Box>
        <Box as="span" bg={t.cursor} color={t.background} ml="1px">
          &nbsp;
        </Box>
      </Box>
      <Box whiteSpace="nowrap">
        <Box as="span" color={p[3]}>
          modified:
        </Box>
        <Box as="span" color={t.foreground}>
          {' notes.md '}
        </Box>
        <Box as="span" color={p[1]}>
          -12
        </Box>
        <Box as="span" color={p[2]}>
          {' +48'}
        </Box>
      </Box>
      <Box whiteSpace="nowrap">
        <Box as="span" bg={t.selBg} color={t.selFg}>
          selected line
        </Box>
        <Box as="span" color={p[5]}>
          {' • '}
        </Box>
        <Box as="span" color={p[8] || t.foreground}>
          side note
        </Box>
      </Box>
    </Box>
  )
}

function ThemeCard({ t, dipakai, tandaSlot, favorit, onPilih, onFavorit }) {
  const rasio = contrast(t.foreground, t.background)
  const aktif = dipakai || !!tandaSlot

  return (
    <Box
      as="button"
      onClick={() => onPilih(t.name)}
      textAlign="left"
      w="100%"
      bg={T.panelAlt}
      border="1px solid"
      borderColor={aktif ? T.accent : T.line}
      borderRadius="10px"
      p="10px"
      position="relative"
      // kartu di luar layar tidak ikut digambar — daftar 400+ tema tetap enteng
      sx={{ contentVisibility: 'auto', containIntrinsicSize: '160px' }}
      transition="background .12s, border-color .12s, transform .12s"
      _hover={{ bg: T.panelHover, borderColor: aktif ? T.accent : T.lineStrong, transform: 'translateY(-1px)' }}
      _focusVisible={{ outline: '2px solid', outlineColor: T.info, outlineOffset: '2px' }}
    >
      <Flex align="center" gap="6px" mb="7px">
        <Text
          fontFamily={FONTS.display}
          fontWeight={600}
          fontSize="13px"
          color={T.text}
          noOfLines={1}
          flex="1"
          title={t.name}
        >
          {t.name}
        </Text>

        {aktif && (
          <Text
            fontSize="10px"
            fontWeight={600}
            color={T.onAccent}
            bg={T.accent}
            px="6px"
            py="1px"
            borderRadius="4px"
            whiteSpace="nowrap"
          >
            {tandaSlot || 'In use'}
          </Text>
        )}

        <Box
          as="span"
          role="button"
          aria-label={favorit ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(e) => {
            e.stopPropagation()
            onFavorit(t.name)
          }}
          fontSize="13px"
          lineHeight="1"
          color={favorit ? T.warn : T.textFaint}
          _hover={{ color: T.warn }}
          px="2px"
        >
          {favorit ? '★' : '☆'}
        </Box>
      </Flex>

      <Preview t={t} />

      <Box mt="7px">
        <Swatches palette={t.palette} />
      </Box>

      <HStack mt="7px" spacing="10px" fontSize="10.5px" color={T.textFaint} whiteSpace="nowrap">
        <Text color={t.light ? T.info : T.textMuted}>{t.light ? 'Light' : 'Dark'}</Text>
        <Text>{t.source === 'buatan' ? 'Yours' : 'Built-in'}</Text>
        <Text>Background {t.background.toUpperCase()}</Text>
        <Text color={rasio >= 4.5 ? T.textFaint : T.warn} ml="auto">
          Legibility {rasio.toFixed(1)}
        </Text>
      </HStack>
    </Box>
  )
}

export default memo(ThemeCard)
