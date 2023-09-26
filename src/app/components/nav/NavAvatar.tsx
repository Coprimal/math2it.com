import Avatar from '@/public/avatar.png'
import Image from 'next/image'
import Link from 'next/link'

export default function NavAvatar() {
  return (
    <div className="shrink-0">
      <Link className="flex items-center overflow-hidden rounded-full" href="/">
        <Image src={Avatar} alt="Math2IT avatar" width={38} height={38} />
      </Link>
    </div>
  )
}
