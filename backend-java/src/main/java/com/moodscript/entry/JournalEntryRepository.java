package com.moodscript.entry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    Page<JournalEntry> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<JournalEntry> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<JournalEntry> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    @Query("select e.id from JournalEntry e where e.userId = :userId")
    List<Long> findIdsByUserId(Long userId);

    @Query("select e.createdAt from JournalEntry e where e.userId = :userId")
    List<java.time.Instant> findCreatedAtByUserId(Long userId);

    @Query("""
            select e from JournalEntry e
            where e.userId = :userId
              and (lower(e.title) like lower(concat('%', :q, '%'))
               or  lower(e.body)  like lower(concat('%', :q, '%')))
            order by e.createdAt desc
            """)
    List<JournalEntry> searchByText(Long userId, String q);
}
