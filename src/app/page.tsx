import { Text, Title, Center, Code } from "@mantine/core";
import { Uploader } from "./_components/uploader";

export default async function Home() {
  return (
    <>
      <div className="p-15 m-15 flex h-screen flex-col items-center justify-center">
        <Center>
          <Title>
            Mantine, TRPC, Prisma, NextAuth + App Directory Template
          </Title>
        </Center>

        <Center>
          <Text>🎈 Mantine + T3 Stack Starter Kit</Text>
        </Center>

        <Center>
          <Text>
            Edit <Code>src/app/page.tsx</Code> to get started
          </Text>
        </Center>
        <div className="w-1/2">
          <Uploader />
        </div>
      </div>
    </>
  );
}
