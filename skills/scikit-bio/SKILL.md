# scikit-bio

## Overview

scikit-bio is a comprehensive Python library for working with biological
data. Apply this skill for bioinformatics analyses spanning sequence
manipulation, alignment, phylogenetics, microbial ecology, and multivariate
statistics.

## When to Use This Skill

Use this skill when the user:
- Works with biological sequences (DNA, RNA, protein)
- Needs to read/write biological file formats (FASTA, FASTQ, GenBank,
  Newick, BIOM, etc.)
- Performs sequence alignments or searches for motifs
- Constructs or analyzes phylogenetic trees
- Calculates diversity metrics (alpha/beta diversity, UniFrac distances)
- Performs ordination analysis (PCoA, CCA, RDA)
- Runs statistical tests on biological/ecological data (PERMANOVA, ANOSIM,
  Mantel)
- Analyzes microbiome or community ecology data
- Works with protein embeddings from language models
- Needs to manipulate biological data tables

## Core Capabilities

### 1. Sequence Manipulation

Work with biological sequences using specialized classes for DNA, RNA, and
protein data.

**Key operations:**
- Read/write sequences from FASTA, FASTQ, GenBank, EMBL formats
- Sequence slicing, concatenation, and searching
- Reverse complement, transcription (DNA→RNA), and translation (RNA→protein)
- Find motifs and patterns using regex
- Calculate distances (Hamming, k-mer based)
- Handle sequence quality scores and metadata

```python
import skbio

seq = skbio.DNA.read('input.fasta')

rc = seq.reverse_complement()
rna = seq.transcribe()
protein = rna.translate()

motif_positions = seq.find_with_regex('ATG[ACGT]{3}')

has_degens = seq.has_degenerates()
seq_no_gaps = seq.degap()
```

**Important notes:**
- Use `DNA`, `RNA`, `Protein` classes for grammared sequences with validation
- Use `Sequence` class for generic sequences without alphabet restrictions
- Quality scores automatically load from FASTQ files into positional metadata
- Metadata types: sequence-level (ID, description), positional (per-base),
  interval (regions/features)

### 2. Sequence Alignment

Perform pairwise and multiple sequence alignments using dynamic programming
algorithms.

**Key capabilities:**
- Global alignment (Needleman-Wunsch, semi-global variant)
- Local alignment (Smith-Waterman)
- Configurable scoring schemes (match/mismatch, gap penalties, substitution
  matrices)
- CIGAR string conversion
- Multiple sequence alignment storage/manipulation with `TabularMSA`

```python
from skbio.alignment import local_pairwise_align_ssw, TabularMSA

alignment = local_pairwise_align_ssw(seq1, seq2)
msa = alignment.aligned_sequences

msa = TabularMSA.read('alignment.fasta', constructor=skbio.DNA)
consensus = msa.consensus()
```

**Important notes:**
- Use `local_pairwise_align_ssw` for local alignments (faster, SSW-based)
- Use `StripedSmithWaterman` for protein alignments
- Affine gap penalties recommended for biological sequences
- Convertible between scikit-bio, BioPython, and Biotite alignment formats

### 3. Phylogenetic Trees

Construct, manipulate, and analyze phylogenetic trees representing
evolutionary relationships.

**Key capabilities:**
- Tree construction from distance matrices (UPGMA, WPGMA, Neighbor Joining,
  GME, BME)
- Tree manipulation (pruning, rerooting, traversal)
- Distance calculations (patristic, cophenetic, Robinson-Foulds)
- ASCII visualization
- Newick format I/O

```python
from skbio import TreeNode
from skbio.tree import nj

tree = TreeNode.read('tree.nwk')
tree = nj(distance_matrix)

subtree = tree.shear(['taxon1', 'taxon2', 'taxon3'])
tips = [node for node in tree.tips()]
lca = tree.lowest_common_ancestor(['taxon1', 'taxon2'])

patristic_dist = tree.find('taxon1').distance(tree.find('taxon2'))
cophenetic_matrix = tree.cophenetic_matrix()

rf_distance = tree.robinson_foulds(other_tree)
```

**Important notes:**
- Use `nj()` for neighbor joining (classic phylogenetic method)
- Use `upgma()` for UPGMA (assumes molecular clock)
- GME and BME scale to very large trees
- Trees can be rooted or unrooted; some metrics require specific rooting

### 4. Diversity Analysis

Calculate alpha and beta diversity metrics for microbial ecology and
community analysis.

**Key capabilities:**
- Alpha diversity: richness, Shannon entropy, Simpson index, Faith's PD,
  Pielou's evenness
- Beta diversity: Bray-Curtis, Jaccard, weighted/unweighted UniFrac,
  Euclidean distances
- Phylogenetic diversity metrics (require tree input)
- Rarefaction and subsampling
- Integration with ordination and statistical tests

```python
from skbio.diversity import alpha_diversity, beta_diversity

alpha = alpha_diversity('shannon', counts_matrix, ids=sample_ids)
faith_pd = alpha_diversity('faith_pd', counts_matrix, ids=sample_ids,
                            tree=tree, otu_ids=feature_ids)

bc_dm = beta_diversity('braycurtis', counts_matrix, ids=sample_ids)
unifrac_dm = beta_diversity('unweighted_unifrac', counts_matrix,
                             ids=sample_ids, tree=tree, otu_ids=feature_ids)

from skbio.diversity import get_alpha_diversity_metrics
print(get_alpha_diversity_metrics())
```

**Important notes:**
- Counts must be integer abundances, not relative frequencies
- Phylogenetic metrics (Faith's PD, UniFrac) require tree + OTU ID mapping
- Use `partial_beta_diversity()` to compute specific sample pairs only
- Alpha diversity returns a Series; beta diversity returns a DistanceMatrix

### 5. Ordination Methods

Reduce high-dimensional biological data to visualizable lower-dimensional
spaces.

**Key capabilities:**
- PCoA (Principal Coordinate Analysis) from distance matrices
- CA (Correspondence Analysis) for contingency tables
- CCA (Canonical Correspondence Analysis) with environmental constraints
- RDA (Redundancy Analysis) for linear relationships
- Biplot projection for feature interpretation

```python
from skbio.stats.ordination import pcoa, cca

pcoa_results = pcoa(distance_matrix)
pc1 = pcoa_results.samples['PC1']
pc2 = pcoa_results.samples['PC2']

cca_results = cca(species_matrix, environmental_matrix)

pcoa_results.write('ordination.txt')
results = skbio.OrdinationResults.read('ordination.txt')
```

**Important notes:**
- PCoA works with any distance/dissimilarity matrix
- CCA reveals environmental drivers of community composition
- Results carry eigenvalues, proportion explained, and sample/feature
  coordinates
- Integrates with matplotlib/seaborn/plotly for visualization

### 6. Statistical Testing

Perform hypothesis tests specific to ecological and biological data.

**Key capabilities:**
- PERMANOVA: test group differences using distance matrices
- ANOSIM: alternative test for group differences
- PERMDISP: test homogeneity of group dispersions
- Mantel test: correlation between distance matrices
- Bioenv: find environmental variables correlated with distances

```python
from skbio.stats.distance import permanova, anosim, mantel

permanova_results = permanova(distance_matrix, grouping, permutations=999)
print(f"p-value: {permanova_results['p-value']}")

anosim_results = anosim(distance_matrix, grouping, permutations=999)

mantel_results = mantel(dm1, dm2, method='pearson', permutations=999)
print(f"Correlation: {mantel_results[0]}, p-value: {mantel_results[1]}")
```

**Important notes:**
- Permutation tests give non-parametric significance
- Use 999+ permutations for robust p-values
- PERMANOVA is sensitive to dispersion differences; pair with PERMDISP
- Mantel tests assess matrix correlation (e.g. geographic vs genetic
  distance)

### 7. File I/O and Format Conversion

Read and write 19+ biological file formats with automatic format detection.

**Supported formats:**
- Sequences: FASTA, FASTQ, GenBank, EMBL, QSeq
- Alignments: Clustal, PHYLIP, Stockholm
- Trees: Newick
- Tables: BIOM (HDF5 and JSON)
- Distances: delimited square matrices
- Analysis: BLAST+6/7, GFF3, Ordination results
- Metadata: TSV/CSV with validation

```python
import skbio

seq = skbio.DNA.read('file.fasta', format='fasta')
tree = skbio.TreeNode.read('tree.nwk')

seq.write('output.fasta', format='fasta')

for seq in skbio.io.read('large.fasta', format='fasta', constructor=skbio.DNA):
    process(seq)

seqs = list(skbio.io.read('input.fastq', format='fastq', constructor=skbio.DNA))
skbio.io.write(seqs, format='fasta', into='output.fasta')
```

**Important notes:**
- Use generators for large files to avoid memory issues
- Format auto-detects when `into` is specified
- Some objects can be written to multiple formats
- Supports stdin/stdout piping with `verify=False`

### 8. Distance Matrices

Create and manipulate distance/dissimilarity matrices.

```python
from skbio import DistanceMatrix
import numpy as np

data = np.array([[0, 1, 2], [1, 0, 3], [2, 3, 0]])
dm = DistanceMatrix(data, ids=['A', 'B', 'C'])

dist_ab = dm['A', 'B']
row_a = dm['A']

dm = DistanceMatrix.read('distances.txt')

pcoa_results = pcoa(dm)
permanova_results = permanova(dm, grouping)
```

**Important notes:**
- `DistanceMatrix` enforces symmetry and a zero diagonal
- `DissimilarityMatrix` allows asymmetric values
- IDs enable integration with metadata and biological knowledge
- Compatible with pandas, numpy, and scikit-learn

### 9. Biological Tables

Work with feature tables (OTU/ASV tables) common in microbiome research.

```python
from skbio import Table

table = Table.read('table.biom')

sample_ids = table.ids(axis='sample')
feature_ids = table.ids(axis='observation')
counts = table.matrix_data

filtered = table.filter(sample_ids_to_keep, axis='sample')

df = table.to_dataframe()
table = Table.from_dataframe(df)
```

**Important notes:**
- BIOM tables are standard in QIIME 2 workflows
- Rows typically represent samples, columns represent features (OTUs/ASVs)
- Supports sparse and dense representations
- Output format configurable (pandas/polars/numpy)

### 10. Protein Embeddings

Work with protein language model embeddings for downstream analysis.

```python
from skbio.embedding import ProteinEmbedding, ProteinVector

embedding = ProteinEmbedding(embedding_array, sequence_ids)

dm = embedding.to_distances(metric='euclidean')
pcoa_results = embedding.to_ordination(metric='euclidean', method='pcoa')

array = embedding.to_array()
df = embedding.to_dataframe()
```

**Important notes:**
- Embeddings bridge protein language models with traditional bioinformatics
- Compatible with scikit-bio's distance/ordination/statistics ecosystem
- `SequenceEmbedding`/`ProteinEmbedding` provide specialized functionality
- Useful for sequence clustering, classification, and visualization

## Best Practices

### Installation
```bash
uv pip install scikit-bio
```

### Performance Considerations
- Use generators for large sequence files to minimize memory usage
- For massive phylogenetic trees, prefer GME or BME over NJ
- Parallelize beta diversity with `partial_beta_diversity()`
- BIOM HDF5 is more efficient than JSON for large tables

### Integration with Ecosystem
- Sequences interoperate with Biopython via standard formats
- Tables integrate with pandas, polars, and AnnData
- Distance matrices are compatible with scikit-learn
- Ordination results are visualizable with matplotlib/seaborn/plotly
- Works seamlessly with QIIME 2 artifacts (BIOM, trees, distance matrices)

### Common Workflows
1. **Microbiome diversity analysis**: read BIOM table → alpha/beta diversity
   → ordination (PCoA) → statistical testing (PERMANOVA)
2. **Phylogenetic analysis**: read sequences → align → build distance matrix
   → construct tree → calculate phylogenetic distances
3. **Sequence processing**: read FASTQ → quality filter → trim/clean → find
   motifs → translate → write FASTA
4. **Comparative genomics**: read sequences → pairwise alignment → calculate
   distances → build tree → analyze clades

## Checklist
- Are counts integer abundances, not relative frequencies, before diversity
  calculations?
- Does every phylogenetic metric (Faith's PD, UniFrac) have a matching
  tree + OTU ID mapping?
- Are large files streamed via generators instead of loaded fully?
- Are permutation tests run with 999+ permutations?
- Is dispersion (PERMDISP) checked alongside PERMANOVA before trusting the
  group-difference result?

## Additional Resources
- Official documentation: https://scikit.bio/docs/latest/
- GitHub repository: https://github.com/scikit-bio/scikit-bio
- Forum support: https://forum.qiime2.org (scikit-bio is part of the QIIME 2
  ecosystem)
