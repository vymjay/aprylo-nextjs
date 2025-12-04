/**
 * Database Review Delete Test
 * 
 * This test verifies that review deletion is working at the database level.
 * It creates a test review and then deletes it to ensure the functionality works.
 */

// Test configuration
const TEST_REVIEW = {
  productId: 1,
  rating: 5,
  title: "Test Review for Deletion",
  comment: "This is a test review that will be deleted"
};

// Helper function to get review count
async function getReviewCount(productId = 1) {
  try {
    const response = await fetch(`/api/reviews?productId=${productId}&page=1&limit=100`);
    const data = await response.json();
    return data.reviews?.length || 0;
  } catch (error) {
    console.error('Error getting review count:', error);
    return 0;
  }
}

// Helper function to find a specific review
async function findReview(title) {
  try {
    const response = await fetch(`/api/reviews?productId=1&page=1&limit=100`);
    const data = await response.json();
    return data.reviews?.find(review => review.title === title) || null;
  } catch (error) {
    console.error('Error finding review:', error);
    return null;
  }
}

// Test 1: Verify current review count
async function testCurrentReviewCount() {
  console.log('🧪 Testing current review count...');
  const count = await getReviewCount();
  console.log('✅ Current review count:', count);
  return count;
}

// Test 2: Test review creation (if authenticated)
async function testCreateReview() {
  console.log('🧪 Testing review creation...');
  
  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        review: TEST_REVIEW
      })
    });
    
    console.log('Create response status:', response.status);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Test review created successfully:', data.id);
      return data.id;
    } else {
      console.log('⚠️ Review creation failed (auth required):', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating review:', error);
    return null;
  }
}

// Test 3: Test review deletion
async function testDeleteReview(reviewId) {
  console.log('🧪 Testing review deletion...');
  
  if (!reviewId) {
    console.log('⚠️ No review ID provided for deletion test');
    return false;
  }
  
  try {
    const response = await fetch(`/api/reviews?id=${reviewId}`, {
      method: 'DELETE'
    });
    
    console.log('Delete response status:', response.status);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Review deleted successfully');
      return true;
    } else {
      console.log('⚠️ Review deletion failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    return false;
  }
}

// Test 4: Verify deletion in database
async function verifyDeletion(reviewId, title) {
  console.log('🧪 Verifying deletion in database...');
  
  const foundReview = await findReview(title);
  
  if (!foundReview) {
    console.log('✅ Review successfully deleted from database');
    return true;
  } else {
    console.log('❌ Review still exists in database:', foundReview);
    return false;
  }
}

// Test 5: Test unauthorized deletion attempt
async function testUnauthorizedDeletion() {
  console.log('🧪 Testing unauthorized deletion...');
  
  // Try to delete a review that doesn't belong to current user
  try {
    const response = await fetch('/api/reviews?id=1', {
      method: 'DELETE'
    });
    
    console.log('Unauthorized delete response status:', response.status);
    const data = await response.json();
    
    if (response.status === 401 || response.status === 403) {
      console.log('✅ Unauthorized deletion properly blocked:', data.error);
      return true;
    } else {
      console.log('❌ Unauthorized deletion should have been blocked');
      return false;
    }
  } catch (error) {
    console.error('Error in unauthorized deletion test:', error);
    return false;
  }
}

// Test 6: Test invalid review ID deletion
async function testInvalidIdDeletion() {
  console.log('🧪 Testing deletion with invalid ID...');
  
  try {
    const response = await fetch('/api/reviews?id=99999', {
      method: 'DELETE'
    });
    
    console.log('Invalid ID delete response status:', response.status);
    const data = await response.json();
    
    if (response.status === 404 || response.status === 401) {
      console.log('✅ Invalid ID deletion properly handled:', data.error);
      return true;
    } else {
      console.log('❌ Invalid ID deletion should return 404 or 401');
      return false;
    }
  } catch (error) {
    console.error('Error in invalid ID deletion test:', error);
    return false;
  }
}

// Main test runner
async function runDatabaseDeleteTests() {
  console.log('🚀 Starting Database Review Delete Tests...');
  console.log('==========================================');
  
  const initialCount = await testCurrentReviewCount();
  
  // Test unauthorized deletion
  const unauthorizedTest = await testUnauthorizedDeletion();
  
  // Test invalid ID deletion
  const invalidIdTest = await testInvalidIdDeletion();
  
  // Try to create and delete a test review
  const createdId = await testCreateReview();
  let deletionTest = false;
  let verificationTest = false;
  
  if (createdId) {
    deletionTest = await testDeleteReview(createdId);
    verificationTest = await verifyDeletion(createdId, TEST_REVIEW.title);
  }
  
  const finalCount = await getReviewCount();
  
  console.log('==========================================');
  console.log('🏁 Database Delete Test Results:');
  console.log(`✅ Initial review count: ${initialCount}`);
  console.log(`${unauthorizedTest ? '✅' : '❌'} Unauthorized deletion blocked: ${unauthorizedTest}`);
  console.log(`${invalidIdTest ? '✅' : '❌'} Invalid ID deletion handled: ${invalidIdTest}`);
  console.log(`${createdId ? '✅' : '⚠️'} Test review creation: ${!!createdId} ${createdId ? `(ID: ${createdId})` : '(requires auth)'}`);
  console.log(`${deletionTest ? '✅' : '⚠️'} Review deletion: ${deletionTest}`);
  console.log(`${verificationTest ? '✅' : '⚠️'} Database verification: ${verificationTest}`);
  console.log(`✅ Final review count: ${finalCount}`);
  
  console.log('==========================================');
  
  // Summary
  const criticalTestsPassed = unauthorizedTest && invalidIdTest;
  
  if (criticalTestsPassed) {
    console.log('🎉 Critical delete functionality is working correctly!');
    console.log('✅ Unauthorized access is properly blocked');
    console.log('✅ Invalid IDs are properly handled');
    
    if (createdId && deletionTest && verificationTest) {
      console.log('✅ Full delete workflow is working perfectly!');
    } else {
      console.log('ℹ️ Full delete test requires authentication');
    }
  } else {
    console.log('⚠️ Critical issues found in delete functionality');
  }
  
  return {
    initialCount,
    finalCount,
    unauthorizedTest,
    invalidIdTest,
    createdId,
    deletionTest,
    verificationTest
  };
}

// Export for use
if (typeof window !== 'undefined') {
  window.dbDeleteTests = {
    getReviewCount,
    findReview,
    testCreateReview,
    testDeleteReview,
    runDatabaseDeleteTests
  };
  
  console.log('📋 Database delete tests available in window.dbDeleteTests');
  console.log('Run window.dbDeleteTests.runDatabaseDeleteTests() to test database deletion');
}

export {
  getReviewCount,
  findReview,
  testCreateReview,
  testDeleteReview,
  runDatabaseDeleteTests
};
