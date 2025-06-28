import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Checkbox, Heading, Text, TextInput } from '@ignite-ui/react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../../../lib/axios'
import { prisma } from '../../../lib/prisma'
import { convertTimeStringToMinutes } from '../../../utils/convert-time-string-to-minutes'
import { getWeekDays } from '../../../utils/get-week-days'
import { buildNextAuthOptions } from '../../api/auth/[...nextauth].api'
import { Container, Header } from '../styles'
import {
  FormError,
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from './styles'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Você precisa selecionar pelo menos um dia da semana!',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h distante do início.',
      },
    ),
})
type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>

type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>

interface TimeIntervalsProps {
  serverIntervals: Array<{
    weekDay: number
    enabled: boolean
    startTime: string
    endTime: string
  }>
}

export default function TimeIntervals({ serverIntervals }: TimeIntervalsProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: serverIntervals,
    },
  })
  const router = useRouter()
  const weekDays = getWeekDays()

  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  })

  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as TimeIntervalsFormOutput

    const response = await api.post('/users/update-time-intervals', {
      intervals,
    })
    await router.push(`/schedule/${response.data.username}`)
  }

  const intervals = watch('intervals')

  return (
    <>
      <NextSeo title="Selecione sua disponibilidade | Ignite Call" noindex />
      <Container>
        <Header>
          <Heading as="strong">Mantenha seus horários atualizados</Heading>
          <Text>
            Atualize o intervalo de horários que você está disponível em cada
            dia da semana.
          </Text>
        </Header>
        <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
          <IntervalsContainer>
            {fields.map((field, index) => {
              return (
                <IntervalItem key={field.id}>
                  <IntervalDay>
                    <Controller
                      name={`intervals.${index}.enabled`}
                      control={control}
                      render={({ field }) => {
                        return (
                          <Checkbox
                            onCheckedChange={(checked) => {
                              field.onChange(checked === true)
                            }}
                            checked={field.value}
                          />
                        )
                      }}
                    />
                    <Text>{weekDays[field.weekDay]}</Text>
                  </IntervalDay>
                  <IntervalInputs>
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      disabled={intervals[index].enabled === false}
                      {...register(`intervals.${index}.startTime`)}
                    />
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      disabled={intervals[index].enabled === false}
                      {...register(`intervals.${index}.endTime`)}
                    />
                  </IntervalInputs>
                </IntervalItem>
              )
            })}
          </IntervalsContainer>
          {errors.intervals && (
            <FormError size="sm">{errors.intervals.message}</FormError>
          )}
          <Button type="submit" disabled={isSubmitting}>
            Atualizar
          </Button>
        </IntervalBox>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  if (!session) {
    return {
      redirect: {
        destination: '/register/update-profile',
        permanent: false,
      },
    }
  }

  const intervals = await prisma.userTimeInterval.findMany({
    where: { user_id: session.user.id },
    select: {
      week_day: true,
      time_start_in_minutes: true,
      time_end_in_minutes: true,
    },
    orderBy: { week_day: 'asc' },
  })

  const weekDaysArr = Array.from({ length: 7 }, (_, i) => {
    const found = intervals.find((itv: any) => itv.week_day === i)
    return {
      weekDay: i,
      enabled: !!found,
      startTime: found
        ? `${String(Math.floor(found.time_start_in_minutes / 60)).padStart(
            2,
            '0',
          )}:${String(found.time_start_in_minutes % 60).padStart(2, '0')}`
        : '08:00',
      endTime: found
        ? `${String(Math.floor(found.time_end_in_minutes / 60)).padStart(
            2,
            '0',
          )}:${String(found.time_end_in_minutes % 60).padStart(2, '0')}`
        : '18:00',
    }
  })

  return {
    props: {
      serverIntervals: weekDaysArr,
    },
  }
}
