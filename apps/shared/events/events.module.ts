import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventStore } from './entities/event-store.entity'
import { InMemoryEventBus } from './in-memory-event-bus'
import { PersistentEventBus } from './persistent-event-bus'
import { TypeOrmEventStoreRepository } from './repositories/typeorm-event-store.repository'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EventStore])],
  providers: [
    TypeOrmEventStoreRepository,
    PersistentEventBus,
    InMemoryEventBus,
    {
      provide: 'EventBus',
      useExisting: PersistentEventBus,
    },
  ],
  exports: [
    'EventBus',
    TypeOrmEventStoreRepository,
    PersistentEventBus,
    InMemoryEventBus,
  ],
})
export class EventsModule {}
