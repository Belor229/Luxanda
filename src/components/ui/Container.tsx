import React from 'react'
import clsx from 'clsx'

type ContainerProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Container UI helper used by institutional pages.
 * Keeps consistent width/padding using the existing `container-custom` utility class.
 */
export function Container({ className, ...props }: ContainerProps) {
  return <div className={clsx('container-custom', className)} {...props} />
}


