import { Box, Flex, Select, Text } from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FiHome } from 'react-icons/fi';
import { GoTrophy } from 'react-icons/go';
import { PiStarFour } from 'react-icons/pi';

import {
  FeedCardContainerSkeleton,
  PowCard,
  SubmissionCard,
} from '@/features/feed';
import { type Rewards } from '@/features/listings';
import { type PrizeListMap } from '@/interface/listings';
import { Home } from '@/layouts/Home';

export interface FeedDataProps {
  id: string;
  createdAt: string;
  like: {
    id: string | undefined;
    date: number;
  }[];
  link: string;
  tweet: string;
  eligibilityAnswers: string;
  otherInfo: string;
  isWinner: boolean;
  winnerPosition: keyof Rewards | undefined;
  description: string;
  firstName: string;
  lastName: string;
  photo: string;
  username: string;
  listingId: number;
  sponsorId: number;
  listingTitle: string;
  rewards: Partial<typeof PrizeListMap> | undefined;
  listingType: string;
  listingSlug: string;
  isWinnersAnnounced: boolean;
  token: string;
  sponsorName: string;
  sponsorLogo: string;
  type: string;
}

export default function Feed() {
  const [data, setData] = useState<FeedDataProps[]>([]);
  const [activeMenu, setActiveMenu] = useState('New');
  const [timePeriod, setTimePeriod] = useState('Today');

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 500 &&
        hasMore &&
        !isLoading
      ) {
        fetchMoreData();
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLoading, hasMore]);

  const fetchMoreData = async () => {
    const currentScrollPosition = window.pageYOffset;
    try {
      const res = await axios.get(`/api/feed/get`, {
        params: {
          filter: activeMenu === 'Popular' ? 'popular' : undefined,
          timePeriod:
            activeMenu === 'Popular' ? timePeriod.toLowerCase() : undefined,
          take: 15,
          skip: 15,
        },
      });

      if (res.data.length < 15) {
        setHasMore(false);
      }

      setData((data) => [...data, ...JSON.parse(res.data)]);
      window.scrollTo(0, currentScrollPosition);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMoreData();
  }, []);

  const NavItem = ({
    name,
    icon: Icon,
    size,
  }: {
    name: string;
    icon: any;
    size: string;
  }) => {
    return (
      <Flex align="center">
        <Box w={7}>
          <Icon color="#64748b" size={size} />
        </Box>
        <Text mt={1.5} color="brand.slate.500" fontWeight={500}>
          {name}
        </Text>
      </Flex>
    );
  };

  const MenuOption = ({ option }: { option: 'New' | 'Popular' }) => (
    <Text
      color={activeMenu === option ? 'brand.slate.700' : 'brand.slate.500'}
      fontWeight={activeMenu === option ? 600 : 400}
      cursor="pointer"
      onClick={() => setActiveMenu(option)}
    >
      {option}
    </Text>
  );

  return (
    <Home type="feed">
      <Box
        mt={'-4'}
        mr={'-25px'}
        borderColor={'brand.slate.200'}
        borderRightWidth={'1px'}
      >
        <Flex>
          <Flex
            pos="sticky"
            top={14}
            direction={'column'}
            gap={3}
            display={{
              base: 'none',
              lg: 'flex',
            }}
            w={60}
            h={'100vh'}
            pt={5}
            pr={5}
            borderRightWidth={'1px'}
          >
            <NavItem name="Homepage" icon={FiHome} size={'21px'} />
            <NavItem name="Leaderboard" icon={PiStarFour} size={'23px'} />
            <NavItem name="Winners" icon={GoTrophy} size={'21px'} />
          </Flex>
          <Flex direction={'column'} w="100%">
            <Box px={5} py={5} borderBottomWidth={'1px'}>
              <Text color="brand.slate.900" fontSize="xl" fontWeight={600}>
                Activity Feed
              </Text>
              <Flex align="center" justify={'space-between'} mt={2}>
                <Text color="brand.slate.600" fontSize="md">
                  Find and discover the best work on Earn
                </Text>
                <Flex align="center" justify={'space-between'} gap={3}>
                  <Flex gap={3}>
                    <MenuOption option="New" />
                    <MenuOption option="Popular" />
                  </Flex>

                  {activeMenu === 'Popular' && (
                    <Select
                      w={28}
                      color={'brand.slate.500'}
                      textAlign={'right'}
                      onChange={(e) => setTimePeriod(e.target.value)}
                      size={'sm'}
                      value={timePeriod}
                      variant={'unstyled'}
                    >
                      <option>Today</option>
                      <option>This Week</option>
                      <option>This Month</option>
                    </Select>
                  )}
                </Flex>
              </Flex>
            </Box>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <FeedCardContainerSkeleton key={index} />
                ))
              : data?.map((item) => {
                  if (item.type === 'Submission') {
                    return (
                      <SubmissionCard
                        key={item.id}
                        sub={item as any}
                        type="activity"
                      />
                    );
                  }
                  if (item.type === 'PoW') {
                    return (
                      <PowCard
                        key={item.id}
                        pow={item as any}
                        type="activity"
                      />
                    );
                  }
                  return null;
                })}
          </Flex>
        </Flex>
      </Box>
    </Home>
  );
}
