interface AvatarProps {
  url: string
  name: string
  size?: number
}

export function Avatar({ url, name, size = 40 }: AvatarProps) {
  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      className="rounded-full bg-indigo-100"
      title={name}
    />
  )
}
